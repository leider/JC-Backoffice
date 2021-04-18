import express, { NextFunction, Request, Response } from "express";

import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import User from "jc-shared/user/user";

import store from "./veranstaltungenstore";

const app = express();

// this file is currently unused

// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

function veranstaltungenForExport(fetcher: Function, req: Request, res: Response, next: NextFunction): void {
  if (!(req.user as User)?.accessrights?.isBookingTeam) {
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

app.get("/zukuenftige/csv", (req, res, next) => veranstaltungenForExport(store.zukuenftigeMitGestern, req, res, next));

app.get("/vergangene/csv", (req, res, next) => veranstaltungenForExport(store.vergangene, req, res, next));

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

export default app;
