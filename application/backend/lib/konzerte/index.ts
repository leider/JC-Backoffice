import express, { Request, Response } from "express";

import Konzert from "jc-shared/konzert/konzert.js";
import User from "jc-shared/user/user.js";

import store from "./konzertestore.js";
import invokeMap from "lodash/invokeMap.js";

const app = express();

// this file is currently unused

// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

function veranstaltungenForExport(fetcher: () => Konzert[], req: Request, res: Response) {
  if (!(req.user as User).accessrights.isBookingTeam) {
    return res.redirect("/");
  }

  const veranstaltungen: Konzert[] = fetcher();
  const lines = invokeMap(veranstaltungen, "toCSV");
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
