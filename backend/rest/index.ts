import express, { Response } from "express";
import { ImageOverviewRow } from "../../shared/veranstaltung/veranstaltung";

import service from "../lib/veranstaltungen/imageService";
import { reply } from "../lib/commons/replies";
import calendarApp from "./calendar";
import mailsenderApp from "./mail";
import optionenApp from "./optionen";
import programmheftApp from "./programmheft";
import usersApp from "./users";
import veranstaltungenRestApp from "./veranstaltungen";
import wikiApp from "./wiki";
import refreshstore from "../lib/site/refreshstore";
import { addPayload } from "../lib/site/onetimeTokens";
const app = express();

app.use("/", calendarApp);
app.use("/", mailsenderApp);
app.use("/", optionenApp);
app.use("/", programmheftApp);
app.use("/", usersApp);
app.use("/", veranstaltungenRestApp);
app.use("/", wikiApp);

function allImageNames(res: Response): void {
  service.alleBildNamen((err?: Error, imagenamesOfFiles?: string[]) => {
    reply(res, err, { names: imagenamesOfFiles });
  });
}

app.post("/logout", (req, res) => {
  const oldId = req.cookies["refresh-token"] as string;
  if (!oldId) {
    return res.sendStatus(401);
  }
  refreshstore.remove(oldId, () => {
    return res.clearCookie("refresh-token").send({});
  });
});

app.get("/imagenames", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    res.sendStatus(403);
    return;
  }
  allImageNames(res);
});

app.post("/imagenames", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.sendStatus(403);
  }

  const rows = req.body as ImageOverviewRow[];
  service.renameImages(rows, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    allImageNames(res);
  });
});

app.post("/onetimeToken", (req, res) => {
  if (!res.locals.accessrights.isAbendkasse()) {
    return res.sendStatus(401);
  }
  const token = addPayload(req.body);
  reply(res, undefined, { token });
});

export default app;
