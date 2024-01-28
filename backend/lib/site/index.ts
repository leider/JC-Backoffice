import pdfEndpoints from "../pdf/pdfEndpoints.js";
import express, { Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { loggers } from "winston";
import { v4 as uuidv4 } from "uuid";
import { Builder, Calendar } from "ikalendar";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import veranstaltungenService from "../veranstaltungen/veranstaltungenService.js";
import store from "../veranstaltungen/veranstaltungenstore.js";
import { resToJson } from "../commons/replies.js";
import userstore from "../users/userstore.js";
import { hashPassword } from "../commons/hashPassword.js";
import conf from "../../../shared/commons/simpleConfigure.js";
import refreshstore from "./refreshstore.js";
import usersService from "../users/usersService.js";
import User from "jc-shared/user/user.js";
import fs from "fs";

const __dirname = new URL(".", import.meta.url).pathname;

const appLogger = loggers.get("application");

const jwtSecret = conf.get("salt") as string;

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.locals.pretty = true;

const refreshTTL = (conf.get("refreshTTL") as number) || 7 * 24 * 60 * 60 * 1000; // days*hours*mins*secs*millis
const jwtTTL = (conf.get("jwtTTL") as number) || 15 * 60; // 15 minutes

app.get("/", (req, res) => {
  return res.redirect("/vue");
});

async function createToken(req: Request, res: Response, name: string) {
  const ttl = refreshTTL;

  function addRefreshToken(res: Response, refreshTokenId: string) {
    res.cookie("refresh-token", refreshTokenId, {
      maxAge: ttl,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
  }

  async function persistRefreshToken(refreshTokenId: string, oldId: string, name: string, ttl: number) {
    await refreshstore.removeExpired();
    const expiry = new Date(Date.now() + ttl);
    return refreshstore.save({ id: oldId || refreshTokenId, userId: name, expiresAt: expiry });
  }

  const token = jwt.sign({ id: name }, jwtSecret, { expiresIn: jwtTTL });
  const refreshTokenId = uuidv4();
  const oldId = (req.cookies["refresh-token"] as string) || "";
  try {
    await persistRefreshToken(refreshTokenId, oldId, name, ttl);
    addRefreshToken(res, oldId || refreshTokenId);
    resToJson(res, { token });
  } catch (e) {
    return res.sendStatus(401);
  }
}

app.post("/refreshtoken", async (req, res) => {
  const oldId = req.cookies["refresh-token"] as string;
  if (!oldId) {
    appLogger.warn("refreshToken without cookie called");
    return res.sendStatus(401);
  }
  try {
    const refreshToken = await refreshstore.forId(oldId);
    if (!refreshToken || DatumUhrzeit.forJSDate(refreshToken.expiresAt).istVor(new DatumUhrzeit())) {
      return res.sendStatus(401);
    }
    return createToken(req, res, refreshToken.userId);
  } catch (e) {
    return res.sendStatus(401);
  }
});

app.post("/login", async (req, res) => {
  const name = req.body.name;
  const pass = req.body.pass;

  try {
    const user = await userstore.forId(name);
    appLogger.info("Try Login for: " + name);
    if (!user) {
      appLogger.error("Login error for: " + name);
      appLogger.error("user not found");
      const all = await userstore.allUsers();
      if (all.length === 0) {
        appLogger.info("No Users found, initializing Database.");
        const firstUser = new User({ id: name, password: pass, gruppen: ["superusers"] });
        await usersService.saveNewUserWithPassword(firstUser);
        return createToken(req, res, name);
      }
      return res.sendStatus(401);
    }
    if (hashPassword(pass, user.salt) === user.hashedPassword) {
      appLogger.info("Successful Login for: " + name);
      return createToken(req, res, name);
    }
    return res.sendStatus(401);
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (e: any) {
    appLogger.error("Login error for: " + name);
    appLogger.error(e?.message || "");
    return res.sendStatus(401);
  }
});

app.post("/logout", async (req, res) => {
  await refreshstore.removeExpired();
  res.cookie("refresh-token", "", {
    maxAge: 0,
    httpOnly: true,
    secure: false,
  });
  return res.clearCookie("refresh-token").send({});
});

const uploadDir = path.join(__dirname, "../../static/upload");

app.get("/imagepreview/:filename", (req, res, next) => {
  // eslint-disable-next-line no-sync
  if (!fs.existsSync(uploadDir + "/" + req.params.filename)) {
    return sharp(uploadDir + "/../No-Image-Placeholder.svg").toBuffer((err, buffer) => {
      if (err) {
        if (err.message === "Input file is missing") {
          return next();
        }
        return next(err);
      }
      res.send(buffer);
    });
  }
  sharp(uploadDir + "/" + req.params.filename)
    .resize({ width: 800 })
    .toBuffer((err, buffer) => {
      if (err) {
        if (err.message === "Input file is missing") {
          return next();
        }
        return next(err);
      }
      res.send(buffer);
    });
});

app.get("/ical/", async (req, res) => {
  try {
    const veranstaltungen = await store.alle();
    if (!veranstaltungen) {
      return res.status(500).send();
    }
    const calendar: Calendar = {
      version: "2.0",
      prodId: "ical by jazzclub",
      events: veranstaltungen
        .filter((v) => v.kopf.confirmed)
        .map((veranstaltung) => ({
          uid: veranstaltung.url || "",
          start: veranstaltung.startDatumUhrzeit.fuerIcal,
          end: veranstaltung.endDatumUhrzeit.fuerIcal,
          summary: veranstaltung.kopf.titelMitPrefix,
          description: veranstaltung.tooltipInfos,
          location: veranstaltung.kopf.ort.replace(/\r\n/g, "\n"),
        })),
    };
    const calString = new Builder(calendar).build();
    return res.type("ics").header("Content-Disposition", "inline; filename=events.ics").send(calString);
  } catch (e) {
    return res.status(500).send();
  }
});

app.get("/imgzip/:yymm", (req, res, next) => {
  veranstaltungenService.imgzip(res, next, req.params.yymm);
});

app.get("/imgzipForVeranstaltung/:url", (req, res, next) => {
  veranstaltungenService.imgzipForVeranstaltung(res, next, req.params.url);
});

app.use("/pdf", pdfEndpoints);

export default app;
