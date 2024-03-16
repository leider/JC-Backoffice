import express, { Request, Response } from "express";
import { ImageOverviewRow } from "jc-shared/konzert/konzert.js";

import service from "../lib/konzerte/imageService.js";
import { resToJson } from "../lib/commons/replies.js";
import calendarApp from "./calendar.js";
import historyApp from "./history.js";
import mailsenderApp from "./mail.js";
import optionenApp from "./optionen.js";
import programmheftApp from "./programmheft.js";
import ridersApp from "./riders.js";
import usersApp from "./users.js";
import konzerteRestApp from "./konzerte.js";
import vermietungenRestApp from "./vermietungen.js";
import wikiApp from "./wiki.js";
import User from "jc-shared/user/user.js";
import { Form } from "multiparty";
import Message from "jc-shared/mail/message.js";
import conf from "jc-shared/commons/simpleConfigure.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import fs from "fs/promises";
import { checkSuperuser } from "./checkAccessHandlers.js";

const app = express();

app.use("/", calendarApp);
app.use("/", historyApp);
app.use("/", mailsenderApp);
app.use("/", optionenApp);
app.use("/", programmheftApp);
app.use("/", ridersApp);
app.use("/", usersApp);
app.use("/", konzerteRestApp);
app.use("/", vermietungenRestApp);
app.use("/", wikiApp);

async function allImageNames(res: Response) {
  const imagenamesOfFiles = await service.alleBildNamen();
  resToJson(res, { names: imagenamesOfFiles });
}

app.get("/imagenames", (req, res) => {
  allImageNames(res);
});

app.post("/imagenames", [checkSuperuser], async (req: Request, res: Response) => {
  const rows = req.body as ImageOverviewRow[];
  await service.renameImages(rows, req.user as User);
  allImageNames(res);
});

app.post("/beleg", async (req: Request, res: Response) => {
  const upload = (req1: Request) =>
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
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
    const buffer = await fs.readFile(datei.path);
    const filename = datei.originalFilename.replace(/[()/]/g, "_");

    const subject = "Beleg aus Back-Office";
    const markdown = `Beleg von ${(req.user as User).name} am ${datum}

${kommentar}`;
    const message = new Message({ subject, markdown: markdown });
    message.pdfBufferAndName = { pdf: buffer, name: filename };
    message.to = conf.belegEmail;
    message.bcc = (req.user as User).email || "";
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
