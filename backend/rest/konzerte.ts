import express, { Request, Response } from "express";
import { Form } from "multiparty";
import fs from "fs";
import path from "path";

import Konzert, { GastArt, NameWithNumber } from "jc-shared/konzert/konzert.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kasse from "jc-shared/konzert/kasse.js";
import User from "jc-shared/user/user.js";

import { resToJson } from "../lib/commons/replies.js";
import konzerteService from "../lib/konzerte/konzerteService.js";
import store from "../lib/konzerte/konzertestore.js";
import { kassenzettelToBuchhaltung } from "../lib/pdf/pdfGeneration.js";
import { checkAbendkasse, checkOrgateam } from "./checkAccessHandlers.js";
import conf from "jc-shared/commons/simpleConfigure.js";

const uploadDir = conf.uploadDir;
const filesDir = conf.filesDir;

const app = express();

async function standardHandler(res: Response, user: User, konzerte: Konzert[]) {
  const result = await konzerteService.filterUnbestaetigteFuerJedermann(konzerte, user);
  resToJson(
    res,
    result.map((v) => v.toJSON()),
  );
}

async function saveAndReply(req: Request, res: Response, konzert: Konzert) {
  const result = await store.saveKonzert(konzert, req.user as User);
  resToJson(res, result);
}

app.get("/konzerte/vergangene", async (req, res) => {
  const konzerte = await store.vergangene();
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzerte/zukuenftige", async (req, res) => {
  const konzerte = await store.zukuenftigeMitGestern();
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzerte/alle", async (req, res) => {
  const konzerte = await store.alle();
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzerte/:startYYYYMM/:endYYYYMM", async (req, res) => {
  const start = DatumUhrzeit.forYYYYMM(req.params.startYYYYMM);
  const end = DatumUhrzeit.forYYYYMM(req.params.endYYYYMM);
  const konzerte = await store.byDateRangeInAscendingOrder(start, end);
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzerte/fortoday", async (req, res) => {
  const today = new DatumUhrzeit();
  const start = today.setUhrzeit(0, 0);
  const end = today.plus({ tage: 1 }).setUhrzeit(23, 59);
  const konzerte = await store.byDateRangeInAscendingOrder(start, end);
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzert/:url", async (req: Request, res: Response) => {
  const konzert = await store.getKonzert(req.params.url);
  if (!konzert) {
    return res.sendStatus(404);
  }
  resToJson(res, konzert);
});

app.post("/konzert", [checkAbendkasse], async (req: Request, res: Response) => {
  const user = req.user as User;
  const url = req.body.url;

  async function saveKonzert(konzert: Konzert | null) {
    if (user.accessrights.isOrgaTeam) {
      return saveAndReply(req, res, new Konzert(req.body));
    } else {
      // Nur Kasse erlaubt
      if (url && konzert) {
        konzert.kasse = new Kasse(req.body.kasse);
        konzert.changelist = req.body.changelist;
        return saveAndReply(req, res, konzert);
      } else {
        return res.status(403).send("Kasse darf nur bestehende speichern");
      }
    }
  }

  const konzert = await store.getKonzert(url);
  if (konzert) {
    const frischFreigegeben = konzert.kasse.kassenfreigabe !== req.body.kasse.kassenfreigabe && !!req.body.kasse.kassenfreigabe;
    if (frischFreigegeben) {
      try {
        await kassenzettelToBuchhaltung(new Konzert(req.body));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("Kassenzettel Versand an Buchhaltung gescheitert");
        throw e;
      }
    }
  }
  return saveKonzert(konzert);
});

app.delete("/konzert", [checkOrgateam], async (req: Request, res: Response) => {
  await store.deleteKonzertById(req.body.id, req.user as User);
  resToJson(res);
});

async function addOrRemoveUserFromSection(func: "addUserToSection" | "removeUserFromSection", req: Request, res: Response) {
  const konzert = await store.getKonzert(req.params.url);
  if (!konzert) {
    return res.sendStatus(404);
  }
  konzert.staff[func](req.user as User, req.body.section);
  return saveAndReply(req, res, konzert);
}

app.post("/konzert/:url/addUserToSection", async (req: Request, res: Response) => {
  return addOrRemoveUserFromSection("addUserToSection", req, res);
});

app.post("/konzert/:url/removeUserFromSection", async (req: Request, res: Response) => {
  return addOrRemoveUserFromSection("removeUserFromSection", req, res);
});

app.post("/konzert/:url/updateGastInSection", async (req: Request, res: Response) => {
  const konzert = await store.getKonzert(req.params.url);
  if (!konzert) {
    return res.sendStatus(404);
  }
  const { item, art }: { item: NameWithNumber; art: GastArt } = req.body;
  const liste: NameWithNumber[] = art === "gast" ? konzert.gaesteliste : konzert.reservierungen;
  (liste.find((entry) => entry.name === item.name) || { alreadyIn: 0 }).alreadyIn = item.alreadyIn;
  return saveAndReply(req, res, konzert);
});

app.post("/upload", [checkOrgateam], async (req: Request, res: Response) => {
  async function copyFile(src: string, dest: string) {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(src);
      readStream.once("error", reject);
      readStream.once("end", resolve);
      readStream.pipe(fs.createWriteStream(dest));
    });
  }

  async function copyToDestination(datei: { originalFilename: string; path: string }, konzert?: Konzert) {
    const dateiname = datei.originalFilename.replace(/[()/]/g, "_");
    const pfad = datei.path;
    await copyFile(pfad, path.join(istPressefoto ? uploadDir : filesDir, dateiname));
    let result = true;
    if (!konzert) {
      throw new Error();
    }
    if (istPressefoto) {
      result = konzert.presse.updateImage(dateiname);
    }
    if (typElement === "vertrag") {
      result = konzert.vertrag.updateDatei(dateiname);
    }
    if (typElement === "rider") {
      result = konzert.technik.updateDateirider(dateiname);
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
    const konzert = await store.getKonzertForId(idElement);
    if (!konzert) {
      return res.sendStatus(500);
    }
    try {
      const calls = files.datei.map((datei: { originalFilename: string; path: string }) => copyToDestination(datei, konzert));
      await Promise.all(calls);
      saveAndReply(req, res, konzert);
    } catch (e) {
      return res.status(500).send((e as Error).message);
    }
  } else {
    res.status(500).send("keine Datei");
  }
});

export default app;
