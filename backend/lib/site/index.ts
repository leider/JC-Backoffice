/* eslint no-underscore-dangle: 0 */
import express from "express";
import path from "path";
import fs from "fs";
import passport from "passport";
import sharp from "sharp";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";
import { Builder, Calendar, Event } from "ikalendar";
import store from "../veranstaltungen/veranstaltungenstore";

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.locals.pretty = true;

app.get("/", (req, res) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/vue/team");
  }
  return res.redirect("/vue/veranstaltungen");
});

app.get("/robots.txt", (req, res, next) => {
  fs.readFile(path.join(__dirname, "views", "robots.txt"), "utf8", (err, data) => {
    if (err) {
      return next(err);
    }
    return res.send(data);
  });
});

app.get("/login", (req, res) => res.render("authenticationRequired"));

app.post("/login", passport.authenticate("local", { failureRedirect: "/login" }), (req, res) => res.redirect("/"));

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
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

function icalForVeranstaltungen(veranstaltungen: Veranstaltung[]): string {
  const events: Event[] = [];

  const calendar: Calendar = {
    version: "2.0",
    prodId: "ical by jazzclub",
    events: events,
  };

  function asICal(veranstaltung: Veranstaltung): void {
    events.push({
      uid: veranstaltung.url || "",
      start: veranstaltung.startDatumUhrzeit().fuerIcal,
      end: veranstaltung.endDatumUhrzeit().fuerIcal,
      summary: veranstaltung.kopf.titelMitPrefix,
      description: veranstaltung.tooltipInfos(),
      location: veranstaltung.kopf.ort.replace(/\r\n/g, "\n"),
    });
  }
  veranstaltungen.forEach((veranstaltung) => asICal(veranstaltung));
  const builder = new Builder(calendar);
  return builder.build();
}

app.get("/ical/", (req, res) => {
  function sendCalendarStringNamedToResult(icalString: string, filename: string, res: express.Response): void {
    res
      .type("ics")
      .header("Content-Disposition", "inline; filename=" + filename + ".ics")
      .send(icalString);
  }

  store.alle((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err || !veranstaltungen) {
      return res.status(500).send(err);
    }
    return sendCalendarStringNamedToResult(icalForVeranstaltungen(veranstaltungen.filter((v) => v.kopf.confirmed)), "events", res);
  });
});

export default app;
