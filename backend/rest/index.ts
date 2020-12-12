import express, { Response } from "express";
import service from "../lib/veranstaltungen/imageService";
import { reply } from "../lib/commons/replies";
import { ImageOverviewRow } from "../../shared/veranstaltung/veranstaltung";
import calendarApp from "./calendar";
import mailsenderApp from "./mail";
import optionenApp from "./optionen";
import programmheftApp from "./programmheft";
import usersApp from "./users";
import veranstaltungenRestApp from "./veranstaltungen";
import wikiApp from "./wiki";

const app = express();

app.use("/", calendarApp);
app.use("/", mailsenderApp);
app.use("/", optionenApp);
app.use("/", programmheftApp);
app.use("/", usersApp);
app.use("/", veranstaltungenRestApp);
app.use("/", wikiApp);

app.get("/csrf-token.json", (req, res) => {
  res.set("Content-Type", "application/json").send({ token: req.csrfToken() });
});

function allImageNames(res: Response): void {
  service.alleBildNamen((err?: Error, imagenamesOfFiles?: string[]) => {
    reply(res, err, { names: imagenamesOfFiles });
  });
}

app.get("/imagenames", (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    res.sendStatus(403);
    return;
  }
  allImageNames(res);
});

app.post("/imagenames", (req, res, next) => {
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

export default app;
