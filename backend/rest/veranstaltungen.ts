import express, { Request, Response } from "express";
import { Form } from "multiparty";
import fs from "fs";
import path from "path";

import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kasse from "jc-shared/veranstaltung/kasse.js";
import User from "jc-shared/user/user.js";

import { resToJson } from "../lib/commons/replies.js";
import veranstaltungenService from "../lib/veranstaltungen/veranstaltungenService.js";
import store from "../lib/veranstaltungen/veranstaltungenstore.js";
import { kassenzettelToBuchhaltung } from "../lib/site/pdfGeneration.js";

const app = express();

async function standardHandler(res: Response, user: User | undefined, veranstaltungen: Veranstaltung[]) {
  const result = veranstaltungenService.filterUnbestaetigteFuerJedermann(veranstaltungen, user);
  resToJson(
    res,
    result.map((v) => v.toJSON())
  );
}

async function saveAndReply(res: Response, veranstaltung: Veranstaltung) {
  const result = await store.saveVeranstaltung(veranstaltung);
  resToJson(res, result);
}

app.get("/veranstaltungen/vergangene", async (req, res) => {
  const veranstaltungen = await store.vergangene();
  standardHandler(res, req.user as User, veranstaltungen);
});

app.get("/veranstaltungen/zukuenftige", async (req, res) => {
  const veranstaltungen = await store.zukuenftigeMitGestern();
  standardHandler(res, req.user as User, veranstaltungen);
});

app.get("/veranstaltungen/alle", async (req, res) => {
  const veranstaltungen = await store.alle();
  standardHandler(res, req.user as User, veranstaltungen);
});

app.get("/veranstaltungen/:startYYYYMM/:endYYYYMM", async (req, res) => {
  const start = DatumUhrzeit.forYYYYMM(req.params.startYYYYMM);
  const end = DatumUhrzeit.forYYYYMM(req.params.endYYYYMM);
  const veranstaltungen = await store.byDateRangeInAscendingOrder(start, end);
  standardHandler(res, req.user as User, veranstaltungen);
});

app.get("/veranstaltungen/:url", async (req: Request, res: Response) => {
  const veranstaltung = await store.getVeranstaltung(req.params.url);
  if (!veranstaltung) {
    res.sendStatus(404);
  }
  resToJson(res, veranstaltung);
});

app.post("/veranstaltungen", async (req: Request, res: Response) => {
  const user = req.user as User;
  if (!user?.accessrights?.isAbendkasse) {
    return res.sendStatus(403);
  }
  // checkFreigabeChanged
  const url = req.body.url;

  async function saveVeranstaltung(veranstaltung?: Veranstaltung) {
    if (user?.accessrights?.isOrgaTeam) {
      return saveAndReply(res, new Veranstaltung(req.body));
    } else {
      // Nur Kasse erlaubt
      if (url && veranstaltung) {
        veranstaltung.kasse = new Kasse(req.body.kasse);
        return saveAndReply(res, veranstaltung);
      } else {
        return res.status(403).send("Kasse darf nur bestehende speichern");
      }
    }
  }

  const veranstaltung = await store.getVeranstaltung(url);
  if (veranstaltung) {
    const frischFreigegeben = veranstaltung.kasse.kassenfreigabe !== req.body.kasse.kassenfreigabe && !!req.body.kasse.kassenfreigabe;
    if (frischFreigegeben) {
      try {
        await kassenzettelToBuchhaltung(new Veranstaltung(req.body));
      } catch (e) {
        console.log("Kassenzettel Versand an Buchhaltung gescheitert");
        throw e;
      }
    }
  }
  return saveVeranstaltung(veranstaltung);
});

app.delete("/veranstaltungen", async (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  await store.deleteVeranstaltungById(req.body.id);
  resToJson(res);
});

async function addOrRemoveUserFromSection(func: "addUserToSection" | "removeUserFromSection", req: Request, res: Response) {
  const veranstaltung = await store.getVeranstaltung(req.params.url);
  if (!veranstaltung) {
    return res.sendStatus(404);
  }
  veranstaltung.staff[func](req.user as User, req.body.section);
  return saveAndReply(res, veranstaltung);
}

app.post("/veranstaltungen/:url/addUserToSection", async (req: Request, res: Response) => {
  return addOrRemoveUserFromSection("addUserToSection", req, res);
});

app.post("/veranstaltungen/:url/removeUserFromSection", async (req: Request, res: Response) => {
  return addOrRemoveUserFromSection("removeUserFromSection", req, res);
});

app.post("/upload", async (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const uploadDir = path.join(__dirname, "../static/upload");
  const filesDir = path.join(__dirname, "../static/files");

  async function copyFile(src: string, dest: string) {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(src);
      readStream.once("error", reject);
      readStream.once("end", resolve);
      readStream.pipe(fs.createWriteStream(dest));
    });
  }

  async function copyToDestination(datei: { originalFilename: string; path: string }, veranstaltung?: Veranstaltung) {
    const dateiname = datei.originalFilename.replace(/[()/]/g, "_");
    const pfad = datei.path;
    await copyFile(pfad, path.join(istPressefoto ? uploadDir : filesDir, dateiname));
    let result = true;
    if (!veranstaltung) {
      throw new Error();
    }
    if (istPressefoto) {
      result = veranstaltung.presse.updateImage(dateiname);
    }
    if (typElement === "vertrag") {
      result = veranstaltung.vertrag.updateDatei(dateiname);
    }
    if (typElement === "rider") {
      result = veranstaltung.technik.updateDateirider(dateiname);
    }
    if (!result) {
      throw new Error("Datei schon vorhanden. Bitte Seite neu laden.");
    }
    return;
  }

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

  const typElement = fields.typ[0];
  const idElement = fields.id[0];
  const istPressefoto = typElement === "pressefoto";

  if (files.datei) {
    const veranstaltung = await store.getVeranstaltungForId(idElement);
    if (!veranstaltung) {
      return res.sendStatus(500);
    }
    try {
      const calls = files.datei.map((datei: { originalFilename: string; path: string }) => copyToDestination(datei, veranstaltung));
      await Promise.all(calls);
      saveAndReply(res, veranstaltung);
    } catch (e) {
      return res.status(500).send((e as Error).message);
    }
  } else {
    res.status(500).send("keine Datei");
  }
});

export default app;
