import pdfEndpoints from "../pdf/pdfEndpoints.js";
import express, { Request, Response } from "express";
import path, { dirname } from "path";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { loggers } from "winston";
import { v4 as uuidv4 } from "uuid";
import { Builder, Calendar } from "ikalendar";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import konzerteService from "../konzerte/konzerteService.js";
import store from "../konzerte/konzertestore.js";
import { resToJson } from "../commons/replies.js";
import userstore from "../users/userstore.js";
import { hashPassword } from "../commons/hashPassword.js";
import conf from "jc-shared/commons/simpleConfigure.js";
import refreshstore from "./refreshstore.js";
import usersService from "../users/usersService.js";
import User, { SUPERUSERS } from "jc-shared/user/user.js";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const appLogger = loggers.get("application");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.locals.pretty = true;

const refreshTTL = conf.refreshTTL || 7 * 24 * 60 * 60 * 1000; // days*hours*mins*secs*millis
const jwtTTL = conf.jwtTTL || 15 * 60; // 15 minutes

app.get("/", (req, res) => {
  return res.redirect("/vue/veranstaltungen");
});

function createToken(req: Request, res: Response, name: string) {
  const ttl = refreshTTL;

  function addRefreshToken(res: Response, refreshTokenId: string) {
    res.cookie("refresh-token", refreshTokenId, {
      maxAge: ttl,
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });
  }

  function persistRefreshToken(refreshTokenId: string, oldId: string, name: string, ttl: number) {
    refreshstore.removeExpired();
    const expiry = new Date(Date.now() + ttl);
    return refreshstore.save({ id: oldId || refreshTokenId, userId: name, expiresAt: expiry });
  }

  const token = jwt.sign({ id: name }, conf.salt, { expiresIn: jwtTTL });
  const refreshTokenId = uuidv4();
  const oldId = (req.cookies["refresh-token"] as string) || "";
  try {
    persistRefreshToken(refreshTokenId, oldId, name, ttl);
    addRefreshToken(res, oldId || refreshTokenId);
    resToJson(res, { token });
  } catch {
    return res.sendStatus(401);
  }
}

app.post("/refreshtoken", (req, res) => {
  const oldId = req.cookies["refresh-token"] as string;
  if (!oldId) {
    appLogger.warn("refreshToken without cookie called");
    return res.sendStatus(401);
  }
  try {
    const refreshToken = refreshstore.forId(oldId);
    if (!refreshToken || DatumUhrzeit.forJSDate(refreshToken.expiresAt).istVor(new DatumUhrzeit())) {
      return res.sendStatus(401);
    }
    return createToken(req, res, refreshToken.userId);
  } catch {
    return res.sendStatus(401);
  }
});

app.post("/login", (req, res) => {
  const name = req.body.name;
  const pass = req.body.pass;

  try {
    const user = userstore.forId(name);
    appLogger.info("Try Login for: " + name);
    if (!user) {
      appLogger.error("Login error for: " + name);
      appLogger.error("user not found");
      const all = userstore.allUsers();
      if (all.length === 0) {
        appLogger.info("No Users found, initializing Database.");
        const firstUser = new User({ id: name, password: pass, gruppen: [SUPERUSERS] });
        usersService.saveNewUserWithPassword(firstUser, firstUser);
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

app.post("/logout", (req, res) => {
  refreshstore.removeExpired();
  res.cookie("refresh-token", "", {
    maxAge: 0,
    httpOnly: true,
    secure: false,
  });
  return res.clearCookie("refresh-token").send({});
});

const uploadDir = conf.uploadDir;
const placeholder = path.join(__dirname, "../../static/upload/../No-Image-Placeholder.svg");

app.get("/imagepreview/:filename", (req, res, next) => {
  // eslint-disable-next-line no-sync
  if (!fs.existsSync(uploadDir + "/" + req.params.filename)) {
    return sharp(placeholder).toBuffer((err, buffer) => {
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

app.get("/ical/", (req, res) => {
  try {
    const konzerte = store.alle();
    if (!konzerte) {
      return res.status(500).send();
    }
    const calendar: Calendar = {
      version: "2.0",
      prodId: "ical by jazzclub",
      events: konzerte
        .filter((v) => v.kopf.confirmed)
        .map((konzert) => ({
          uid: konzert.url || "",
          start: konzert.startDatumUhrzeit.fuerIcal,
          end: konzert.endDatumUhrzeit.fuerIcal,
          summary: konzert.kopf.titelMitPrefix,
          description: konzert.tooltipInfos,
          location: konzert.kopf.ort.replace(/\r\n/g, "\n"),
        })),
    };
    const calString = new Builder(calendar).build();
    return res.type("ics").header("Content-Disposition", "inline; filename=events.ics").send(calString);
  } catch {
    return res.status(500).send();
  }
});

app.get("/imgzip/:yymm", (req, res, next) => {
  konzerteService.imgzip(res, next, req.params.yymm);
});

app.get("/imgzipForVeranstaltung/:url", (req, res, next) => {
  konzerteService.imgzipForKonzert(res, next, req.params.url);
});

app.use("/pdf", pdfEndpoints);

export default app;
