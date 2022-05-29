import express, { NextFunction, Request, Response } from "express";
import path from "path";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { loggers } from "winston";
import { v4 as uuidv4 } from "uuid";
import { Builder, Calendar } from "ikalendar";

import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import User from "jc-shared/user/user";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";

import veranstaltungenService from "../veranstaltungen/veranstaltungenService";
import store from "../veranstaltungen/veranstaltungenstore";
import { resToJson } from "../commons/replies";
import userstore from "../users/userstore";
import { hashPassword } from "../commons/hashPassword";
import conf from "../commons/simpleConfigure";
import refreshstore from "./refreshstore";
import { kassenbericht, kassenzettel, vertrag } from "./pdfGeneration";

const appLogger = loggers.get("application");

const jwtSecret = conf.get("salt") as string;

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.locals.pretty = true;

app.get("/", (req, res) => {
  return res.redirect("/vue/veranstaltungen");
});

async function createToken(req: Request, res: Response, name: string) {
  const ttl = 7 * 24 * 60 * 60 * 1000; // days*hours*mins*secs*millis

  function addRefreshToken(res: Response, refreshTokenId: string) {
    res.cookie("refresh-token", refreshTokenId, {
      maxAge: ttl,
      httpOnly: true,
      secure: false,
    });
  }

  async function persistRefreshToken(refreshTokenId: string, oldId: string, name: string, ttl: number) {
    await refreshstore.remove(oldId);
    const expiry = new Date(Date.now() + ttl);
    return refreshstore.save({ id: refreshTokenId, userId: name, expiresAt: expiry });
  }

  const token = jwt.sign({ id: name }, jwtSecret, {
    expiresIn: 15 * 60, // 15 minutes
  });
  const refreshTokenId = uuidv4();
  const oldId = (req.cookies["refresh-token"] as string) || "";
  try {
    await persistRefreshToken(refreshTokenId, oldId, name, ttl);
    addRefreshToken(res, refreshTokenId);
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
    appLogger.info("Login for: " + name);
    if (!user) {
      appLogger.error("Login error for: " + name);
      appLogger.error("user not found");
      return res.sendStatus(401);
    }
    if (hashPassword(pass, user.salt) === user.hashedPassword) {
      return createToken(req, res, name);
    }
    return res.sendStatus(401);
  } catch (e) {
    appLogger.error("Login error for: " + name);
    appLogger.error((e as any)?.message || "");
    return res.sendStatus(401);
  }
});

const uploadDir = path.join(__dirname, "../../static/upload");

app.get("/imagepreview/:filename", (req, res, next) => {
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
  store.alle((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err || !veranstaltungen) {
      return res.status(500).send(err);
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
  });
});

app.get("/kassenbericht/:year/:month", (req: Request, res: Response, next: NextFunction) => {
  const datum = DatumUhrzeit.forYYYYMM(req.params.year + "" + req.params.month);
  kassenbericht(res, next, datum);
});

app.get("/pdf/kassenzettel/:url", (req, res, next) => {
  kassenzettel(res, next, req.params.url);
});

app.get("/pdf/vertrag/:url/:language", (req, res, next) => {
  vertrag(res, next, req.params.url, req.params.language);
});

app.get("/imgzip/:yymm", (req, res, next) => {
  veranstaltungenService.imgzip(res, next, req.params.yymm);
});

export default app;
