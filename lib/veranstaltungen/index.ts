import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const zipstream = require("zip-stream");
import express from "express";
import async from "async";
import { flatten, uniq } from "lodash";

import path from "path";
import fieldHelpers from "../commons/fieldHelpers";

import optionenService from "../optionen/optionenService";
import store from "./veranstaltungenstore";
import service from "./veranstaltungenService";
import Veranstaltung from "./object/veranstaltung";
import Vertrag from "./object/vertrag";
import DatumUhrzeit from "../commons/DatumUhrzeit";
import OptionValues from "../optionen/optionValues";
import Orte from "../optionen/orte";

import { addRoutesTo } from "./indexDetails";
import { expressAppIn } from "../middleware/expressViewHelper";

const app = expressAppIn(__dirname);

const uploadDir = path.join(__dirname, "../../static/upload");

// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

type CalendarEvent = {
  start: string;
  end: string;
  url: string;
  title: string;
  tooltip: string;
  className: string;
};

function filterUnbestaetigteFuerJedermann(veranstaltungen: Veranstaltung[], res: express.Response): Veranstaltung[] {
  if (res.locals.accessrights.isBookingTeam()) {
    return veranstaltungen;
  }
  return veranstaltungen.filter((v) => v.kopf.confirmed);
}

function veranstaltungenForExport(fetcher: Function, next: express.NextFunction, res: express.Response): void {
  if (!res.locals.accessrights.isBookingTeam()) {
    return res.redirect("/");
  }

  return fetcher((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return next(err);
    }
    const lines = veranstaltungen.map((veranstaltung) => veranstaltung.toCSV());
    return res.set("Content-Type", "text/csv").send(lines);
  });
}

function eventsBetween(start: DatumUhrzeit, end: DatumUhrzeit, res: express.Response, callback: Function): void {
  function asCalendarEvent(veranstaltung: Veranstaltung): CalendarEvent {
    const urlSuffix = res.locals.accessrights.isOrgaTeam() ? "/allgemeines" : "/preview";

    return {
      start: veranstaltung.startDate.toISOString(),
      end: veranstaltung.endDate.toISOString(),
      url: veranstaltung.fullyQualifiedUrl() + urlSuffix,
      title: veranstaltung.kopf.titel,
      tooltip: veranstaltung.tooltipInfos(),
      className:
        (!veranstaltung.kopf.confirmed ? "color-geplant " : "") +
        "verySmall color-" +
        fieldHelpers.cssColorCode(veranstaltung.kopf.eventTyp),
    };
  }

  store.byDateRangeInAscendingOrder(start, end, (err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return callback(err);
    }
    return callback(null, filterUnbestaetigteFuerJedermann(veranstaltungen, res).map(asCalendarEvent));
  });
}

app.get("/", (req, res) => res.redirect("/vue/veranstaltungen/zukuenftige"));

app.get("/zukuenftige", (req, res) => res.redirect("/vue/veranstaltungen/zukuenftige"));

app.get("/vergangene", (req, res) => res.redirect("/vue/veranstaltungen/vergangene"));

app.get("/zukuenftige/csv", (req, res, next) => veranstaltungenForExport(store.zukuenftigeMitGestern, next, res));

app.get("/vergangene/csv", (req, res, next) => veranstaltungenForExport(store.vergangene, next, res));

app.get("/new", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  return optionenService.optionenUndOrte((err: Error | null, optionen: OptionValues, orte: Orte) => {
    if (err) {
      return next(err);
    }
    return res.render("edit/allgemeines", {
      veranstaltung: new Veranstaltung(),
      optionen,
      orte,
      Vertrag,
    });
  });
});

app.get("/monat/:monat", (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(start, end, (err: Error | null, result: Veranstaltung[]) => {
    if (err) {
      return next(err);
    }
    return res.render("monatsliste", { liste: result, monat: yymm });
  });
});

app.get("/imgzip/:monat", (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(start, end, (err: Error | null, result: Veranstaltung[]) => {
    if (err) {
      return next(err);
    }
    const images = flatten(result.map((veranst) => veranst.presse.image)).map((filename) => {
      return { path: uploadDir + "/" + filename, name: filename };
    });
    const filename = "Jazzclub Bilder " + start.monatJahrKompakt + ".zip";

    res.header("Content-Type", "application/zip");
    res.header("Content-Disposition", 'attachment; filename="' + filename + '"');

    const zip = zipstream({ level: 1 });
    zip.pipe(res); // res is a writable stream

    return async.forEachSeries(
      images,
      (file, cb) => {
        zip.entry(fs.createReadStream(file.path), { name: file.name }, cb);
      },
      (err1) => {
        if (err1) {
          return next(err1);
        }
        return zip.finalize();
      }
    );
  });
});

app.get("/texte/:monat", (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(start, end, (err: Error | null, result: Veranstaltung[]) => {
    if (err) {
      return next(err);
    }
    return res.render("pressetexte", { liste: result, monat: yymm });
  });
});

app.get("/eventsForCalendar", (req, res, next) => {
  const start = DatumUhrzeit.forISOString(req.query.start);
  const end = DatumUhrzeit.forISOString(req.query.end);
  eventsBetween(start, end, res, (err1: Error | null, events: CalendarEvent[]) => {
    if (err1) {
      return next(err1);
    }
    return res.end(JSON.stringify(events));
  });
});

app.post("/updateStaff", (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect("/");
  }

  const body = req.body;
  return store.getVeranstaltungForId(body.id, (err: Error | null, veranstaltung: Veranstaltung) => {
    if (err || !veranstaltung) {
      return next(err);
    }
    veranstaltung.staff.updateStaff(body.staff || {});
    return store.saveVeranstaltung(veranstaltung, (err1: Error | null) => {
      if (err1 || !veranstaltung) {
        return next(err1);
      }
      return res.redirect("/");
    });
  });
});

function standardCallback(res: express.Response): Function {
  return (err: Error, veranstaltungen: Veranstaltung[]): void => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    const result = filterUnbestaetigteFuerJedermann(veranstaltungen, res).map((v) => v.toJSON());
    res.set("Content-Type", "application/json").send(result);
  };
}
app.get("/vergangene.json", (req, res) => {
  store.vergangene(standardCallback(res));
});

app.get("/zukuenftige.json", (req, res) => {
  store.zukuenftigeMitGestern(standardCallback(res));
});

app.get("/alle.json", (req, res) => {
  store.alle(standardCallback(res));
});

app.get("/:startYYYYMM/:endYYYYMM/list.json", (req, res) => {
  const start = DatumUhrzeit.forYYYYMM(req.params.startYYYYMM);
  const end = DatumUhrzeit.forYYYYMM(req.params.endYYYYMM);
  store.byDateRangeInAscendingOrder(start, end, standardCallback(res));
});

app.get("/:url.json", (req, res, next) => {
  store.alle((err: Error, veranstaltungen: Veranstaltung[]): void => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    const veranstaltung = veranstaltungen.find((v) => v.url === req.params.url);
    res.set("Content-Type", "application/json").send(veranstaltung);
  });
});

addRoutesTo(app);

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

export default app;
