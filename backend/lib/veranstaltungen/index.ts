import fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const zipstream = require("zip-stream");

import express from "express";
import async from "async";
import flatten from "lodash/flatten";

import path from "path";

import store from "./veranstaltungenstore";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";

import { addRoutesTo } from "./indexDetails";
import { expressAppIn } from "../middleware/expressViewHelper";
import { reply } from "../commons/replies";

const app = expressAppIn(__dirname);

const uploadDir = path.join(__dirname, "../../static/upload");

// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

export function filterUnbestaetigteFuerJedermann(veranstaltungen: Veranstaltung[], res: express.Response): Veranstaltung[] {
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
    return res.type("csv").send(lines);
  });
}

app.get("/zukuenftige/csv", (req, res, next) => veranstaltungenForExport(store.zukuenftigeMitGestern, next, res));

app.get("/vergangene/csv", (req, res, next) => veranstaltungenForExport(store.vergangene, next, res));

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

    res.type("zip");
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

function standardCallback(res: express.Response): Function {
  return (err: Error, veranstaltungen: Veranstaltung[]) => {
    const result = filterUnbestaetigteFuerJedermann(veranstaltungen, res).map((v) => v.toJSON());
    reply(res, err, result);
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

addRoutesTo(app);

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

export default app;
