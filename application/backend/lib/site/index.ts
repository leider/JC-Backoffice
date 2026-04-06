import pdfEndpoints from "../pdf/pdfEndpoints.js";
import express, { Request, Response } from "express";
import path, { dirname } from "path";
import sharp from "sharp";
import { loggers } from "winston";
import { Builder, Calendar } from "ikalendar";

import konzerteService from "../konzerte/konzerteService.js";
import store from "../konzerte/konzertestore.js";
import { resToJson } from "../commons/replies.js";
import userstore from "../users/userstore.js";
import { hashPassword } from "../commons/hashPassword.js";
import usersService from "../users/usersService.js";
import User, { SUPERUSERS } from "jc-shared/user/user.js";
import fs from "fs";
import { fileURLToPath } from "url";
import filter from "lodash/filter.js";
import map from "lodash/map.js";
import { SESSION_COOKIE_NAME } from "../middleware/createSessionMiddleware.js";
import conf from "../../simpleConfigure.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const appLogger = loggers.get("application");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.locals.pretty = true;

app.get("/", (req, res) => {
  return res.redirect("/vue/veranstaltungen");
});

function saveSession(req: Request): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.save((err) => (err ? reject(err) : resolve()));
  });
}

async function establishSession(req: Request, res: Response, userId: string): Promise<void> {
  req.session.userId = userId;
  try {
    await saveSession(req);
    resToJson(res, { ok: true });
  } catch (e) {
    appLogger.error("(establishSession)", e);
    res.sendStatus(500);
  }
}

app.post("/login", async (req, res) => {
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
        const firstUser = new User({ id: name, password: pass, gruppen: SUPERUSERS });
        usersService.saveNewUserWithPassword(firstUser, firstUser);
        await establishSession(req, res, name);
        return;
      }
      res.sendStatus(401);
      return;
    }
    if (hashPassword(pass, user.salt) === user.hashedPassword) {
      appLogger.info("Successful Login for: " + name);
      await establishSession(req, res, name);
      return;
    }
    res.sendStatus(401);
    return;
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (e: any) {
    appLogger.error("(/login) Login error for: " + name);
    appLogger.error(e?.message || "");
    res.sendStatus(401);
    return;
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      appLogger.error("(/logout)", err);
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: "/" });
    res.send({});
  });
});

const uploadDir = conf.uploadDir;
const placeholder = path.join(__dirname, "../../static/placeholder.png");

app.get("/imagepreview/:filename", (req, res, next) => {
  function sendOrHandleError(err: Error, buffer: Buffer) {
    if (err) {
      err.message === "Input file is missing" ? next() : next(err);
      return;
    }
    res.send(buffer);
  }

  if (!fs.existsSync(uploadDir + "/" + req.params.filename)) {
    sharp(placeholder).toBuffer(sendOrHandleError);
    return;
  }
  sharp(uploadDir + "/" + req.params.filename)
    .resize({ width: 800 })
    .toBuffer(sendOrHandleError);
});

app.get("/ical/", (req, res) => {
  try {
    const konzerte = store.alle();
    if (!konzerte) {
      res.status(500).send();
      return;
    }
    const calendar: Calendar = {
      version: "2.0",
      prodId: "ical by jazzclub",
      events: map(filter(konzerte, "kopf.confirmed"), (konzert) => ({
        uid: konzert.url || "",
        start: konzert.startDatumUhrzeit.fuerIcal,
        end: konzert.endDatumUhrzeit.fuerIcal,
        summary: konzert.kopf.titelMitPrefix,
        description: konzert.tooltipInfos,
        location: konzert.kopf.ort.replace(/\r\n/g, "\n"),
      })),
    };
    const calString = new Builder(calendar).build();
    res.type("ics").header("Content-Disposition", "inline; filename=events.ics").send(calString);
    return;
  } catch {
    res.status(500).send();
    return;
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
