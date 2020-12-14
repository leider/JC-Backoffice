import express from "express";

import store from "./veranstaltungenstore";
import Veranstaltung from "../../../shared/veranstaltung/veranstaltung";

const app = express();

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

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

export default app;
