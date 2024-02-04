import express, { Request, Response } from "express";

import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import User from "jc-shared/user/user.js";

import store from "./veranstaltungenstore.js";

const app = express();

// this file is currently unused

// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

async function veranstaltungenForExport(fetcher: () => Veranstaltung[], req: Request, res: Response) {
  if (!(req.user as User).accessrights.isBookingTeam) {
    return res.redirect("/");
  }

  const veranstaltungen: Veranstaltung[] = await fetcher();
  const lines = veranstaltungen.map((veranstaltung) => veranstaltung.toCSV());
  return res.type("csv").send(lines);
}

app.get("/zukuenftige/csv", (req, res) => veranstaltungenForExport(store.zukuenftigeMitGestern, req, res));

app.get("/vergangene/csv", (req, res) => veranstaltungenForExport(store.vergangene, req, res));

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

export default app;
