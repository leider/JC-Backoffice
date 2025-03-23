import express, { Request, Response } from "express";

import Konzert, { GastArt, KonzertFileUploadType, NameWithNumber } from "jc-shared/konzert/konzert.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Kasse from "jc-shared/konzert/kasse.js";
import User from "jc-shared/user/user.js";

import { resToJson } from "../lib/commons/replies.js";
import konzerteService from "../lib/konzerte/konzerteService.js";
import store from "../lib/konzerte/konzertestore.js";
import { kassenzettelToBuchhaltung } from "../lib/pdf/pdfGeneration.js";
import { checkAbendkasse, checkOrgateam } from "./checkAccessHandlers.js";
import parseFormData from "../lib/commons/parseFormData.js";
import find from "lodash/find.js";

const app = express();

function standardHandler(res: Response, user: User, konzerte: Konzert[]) {
  const result = konzerteService.filterUnbestaetigteFuerJedermann(konzerte, user);
  resToJson(res, result);
}

function saveAndReply(req: Request, res: Response, konzert: Konzert) {
  const result = store.saveKonzert(konzert, req.user as User);
  resToJson(res, result);
}

app.get("/konzerte/vergangene", (req, res) => {
  const konzerte = store.vergangene();
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzerte/zukuenftige", (req, res) => {
  const konzerte = store.zukuenftigeMitGestern();
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzerte/alle", (req, res) => {
  const konzerte = store.alle();
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzerte/:startYYYYMM/:endYYYYMM", (req, res) => {
  const start = DatumUhrzeit.forYYYYMM(req.params.startYYYYMM);
  const end = DatumUhrzeit.forYYYYMM(req.params.endYYYYMM);
  const konzerte = store.byDateRangeInAscendingOrder(start, end);
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzerte/fortoday", (req, res) => {
  const today = new DatumUhrzeit();
  const start = today.setUhrzeit(0, 0);
  const end = today.plus({ tage: 1 }).setUhrzeit(23, 59);
  const konzerte = store.byDateRangeInAscendingOrder(start, end);
  standardHandler(res, req.user as User, konzerte);
});

app.get("/konzert/:url", (req, res) => {
  const konzert = store.getKonzert(req.params.url);
  if (!konzert) {
    res.sendStatus(404);
    return;
  }
  resToJson(res, konzert);
});

app.post("/konzert", [checkAbendkasse], (req: Request, res: Response) => {
  const user = req.user as User;
  const url = req.body.url;

  async function saveKonzert(konzert: Konzert | null) {
    if (user.accessrights.isOrgaTeam) {
      return saveAndReply(req, res, new Konzert(req.body));
    } else {
      // Nur Kasse erlaubt
      if (url && konzert) {
        konzert.kasse = new Kasse(req.body.kasse);
        konzert.gaesteliste = req.body.gaesteliste;
        konzert.reservierungen = req.body.reservierungen;
        konzert.changelist = req.body.changelist;
        saveAndReply(req, res, konzert);
        return;
      } else {
        res.status(403).send("Kasse darf nur bestehende speichern");
      }
    }
  }

  const konzert = store.getKonzert(url);
  if (konzert) {
    const frischFreigegeben = konzert.kasse.kassenfreigabe !== req.body.kasse.kassenfreigabe && !!req.body.kasse.kassenfreigabe;
    if (frischFreigegeben) {
      try {
        kassenzettelToBuchhaltung(new Konzert(req.body));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("Kassenzettel Versand an Buchhaltung gescheitert");
        throw e;
      }
    }
  }
  return saveKonzert(konzert);
});

app.delete("/konzert", [checkOrgateam], (req: Request, res: Response) => {
  store.deleteKonzertById(req.body.id, req.user as User);
  resToJson(res);
});

function addOrRemoveUserFromSection(func: "addUserToSection" | "removeUserFromSection", req: Request, res: Response) {
  const konzert = store.getKonzert(req.params.url);
  if (!konzert) {
    return res.sendStatus(404);
  }
  konzert.staff[func](req.user as User, req.body.section);
  return saveAndReply(req, res, konzert);
}

app.post("/konzert/:url/addUserToSection", (req: Request, res: Response) => {
  addOrRemoveUserFromSection("addUserToSection", req, res);
});

app.post("/konzert/:url/removeUserFromSection", (req: Request, res: Response) => {
  addOrRemoveUserFromSection("removeUserFromSection", req, res);
});

app.post("/konzert/:url/updateGastInSection", (req: Request, res: Response) => {
  const konzert = store.getKonzert(req.params.url);
  if (!konzert) {
    res.sendStatus(404);
    return;
  }
  const { item, art }: { item: NameWithNumber; art: GastArt } = req.body;
  const liste: NameWithNumber[] = art === "gast" ? konzert.gaesteliste : konzert.reservierungen;
  (find(liste, { name: item.name }) || { alreadyIn: 0 }).alreadyIn = item.alreadyIn;
  return saveAndReply(req, res, konzert);
});

app.post("/upload", [checkOrgateam], async (req: Request, res: Response) => {
  const { fields, files } = await parseFormData(req);

  if (!files.datei || !fields.typ || !fields.id) {
    res.status(500).send("keine Datei, Typ oder ID");
    return;
  }
  const konzert = store.getKonzertForId((fields.id ?? [])[0]);
  if (!konzert) {
    res.sendStatus(500);
    return;
  }
  try {
    await konzerteService.addAndSaveImages({ konzert, dateien: files.datei, typ: fields.typ[0] as KonzertFileUploadType });
    saveAndReply(req, res, konzert);
  } catch (e) {
    res.status(500).send((e as Error).message);
    return;
  }
});

export default app;
