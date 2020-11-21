import fs from "fs";
import express from "express";
import async from "async";
import flatten from "lodash/flatten";

import path from "path";

import store from "./veranstaltungenstore";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "../../../shared/commons/DatumUhrzeit";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const zipstream = require("zip-stream");

const app = express();

const uploadDir = path.join(__dirname, "../../static/upload");

// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

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

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

export default app;
