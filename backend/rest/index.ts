import express, { Request, Response } from "express";
import { ImageOverviewRow } from "jc-shared/veranstaltung/veranstaltung";

import service from "../lib/veranstaltungen/imageService";
import { resToJson } from "../lib/commons/replies";
import calendarApp from "./calendar";
import mailsenderApp from "./mail";
import optionenApp from "./optionen";
import programmheftApp from "./programmheft";
import usersApp from "./users";
import veranstaltungenRestApp from "./veranstaltungen";
import wikiApp from "./wiki";
import refreshstore from "../lib/site/refreshstore";
import User from "jc-shared/user/user";
import { Form } from "multiparty";
import Message from "jc-shared/mail/message";
import conf from "../lib/commons/simpleConfigure";
import mailtransport from "../lib/mailsender/mailtransport";
import fs from "fs/promises";

const app = express();

app.use("/", calendarApp);
app.use("/", mailsenderApp);
app.use("/", optionenApp);
app.use("/", programmheftApp);
app.use("/", usersApp);
app.use("/", veranstaltungenRestApp);
app.use("/", wikiApp);

async function allImageNames(res: Response) {
  const imagenamesOfFiles = await service.alleBildNamen();
  resToJson(res, { names: imagenamesOfFiles });
}

app.post("/logout", async (req, res) => {
  const oldId = req.cookies["refresh-token"] as string;
  if (!oldId) {
    return res.sendStatus(401);
  }
  await refreshstore.remove(oldId);
  return res.clearCookie("refresh-token").send({});
});

app.get("/imagenames", (req, res) => {
  allImageNames(res);
});

app.post("/imagenames", async (req, res) => {
  if (!(req.user as User)?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }

  const rows = req.body as ImageOverviewRow[];
  await service.renameImages(rows);
  allImageNames(res);
});

app.post("/beleg", async (req: Request, res: Response) => {
  const user = req.user as User;
  if (!user?.accessrights?.isSuperuser) {
    return res.sendStatus(403);
  }

  const upload = (req1: Request) =>
    new Promise<any[]>((resolve, reject) => {
      new Form().parse(req1, function (err, fields, files) {
        if (err) {
          return reject(err);
        }

        return resolve([fields, files]);
      });
    });

  const [fields, files] = await upload(req);

  const datum = fields.datum[0];
  const kommentar = fields.kommentar[0];

  if (files.datei) {
    const datei = files.datei[0];
    // eslint-disable-next-line no-sync
    const buffer = await fs.readFile(datei.path);
    const filename = datei.originalFilename.replace(/[()/]/g, "_");

    const subject = "Beleg aus Back-Office";
    const markdown = `Beleg von ${user.name} am ${datum}

${kommentar}`;
    const message = new Message({ subject, markdown: markdown });
    message.pdfBufferAndName = { pdf: buffer, name: filename };
    message.to = conf.get("beleg-email") as string;
    message.bcc = user.email || "";
    if (!message.to) {
      return res.status(500).send("Kein Empfänger");
    }
    await mailtransport.sendDatevMail(message);
    return res.status(200).send("Ok");
  } else {
    res.status(500).send("keine Datei");
  }
});

export default app;
