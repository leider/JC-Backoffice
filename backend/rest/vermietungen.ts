import express, { Request, Response } from "express";

import Vermietung from "jc-shared/vermietung/vermietung.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import User from "jc-shared/user/user.js";

import { resToJson } from "../lib/commons/replies.js";
import store from "../lib/vermietungen/vermietungenstore.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import { vermietungVertragToBuchhaltung } from "../lib/pdf/pdfGeneration.js";
import vermietungenService from "../lib/vermietungen/vermietungenService.js";

const app = express();

async function standardHandler(req: Request, res: Response, vermietungen: Vermietung[]) {
  const user: User = req.user as User;
  resToJson(
    res,
    vermietungenService.filterUnbestaetigteFuerJedermann(vermietungen, user).map((v) => v.toJSON()),
  );
}

async function saveAndReply(req: Request, res: Response, vermietung: Vermietung) {
  const result = await store.saveVermietung(vermietung, req.user as User);
  resToJson(res, result);
}

app.get("/vermietungen/vergangene", async (req, res) => {
  const vermietungen = await store.vergangene();
  standardHandler(req, res, vermietungen);
});

app.get("/vermietungen/zukuenftige", async (req, res) => {
  const vermietungen = await store.zukuenftigeMitGestern();
  standardHandler(req, res, vermietungen);
});

app.get("/vermietungen/alle", async (req, res) => {
  const vermietungen = await store.alle();
  standardHandler(req, res, vermietungen);
});

app.get("/vermietungen/:startYYYYMM/:endYYYYMM", async (req, res) => {
  const start = DatumUhrzeit.forYYYYMM(req.params.startYYYYMM);
  const end = DatumUhrzeit.forYYYYMM(req.params.endYYYYMM);
  const vermietungen = await store.byDateRangeInAscendingOrder(start, end);
  standardHandler(req, res, vermietungen);
});

app.get("/vermietungen/:url", async (req: Request, res: Response) => {
  const vermietung = await store.getVermietung(req.params.url);
  if (!vermietung) {
    return res.sendStatus(404);
  }
  resToJson(res, vermietung);
});

app.post("/vermietungen", [checkOrgateam], async (req: Request, res: Response) => {
  const url = req.body.url;

  const vermietung = await store.getVermietung(url);
  if (vermietung) {
    const frischFreigegeben = vermietung.angebot.freigabe !== req.body.angebot.freigabe && !!req.body.angebot.freigabe;
    if (frischFreigegeben) {
      try {
        await vermietungVertragToBuchhaltung(new Vermietung(req.body));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("Vermietungsvertrag Versand an Buchhaltung gescheitert");
        throw e;
      }
    }
  }
  return saveAndReply(req, res, new Vermietung(req.body));
});

app.delete("/vermietungen", [checkOrgateam], async (req: Request, res: Response) => {
  await store.deleteVermietungById(req.body.id, req.user as User);
  resToJson(res);
});

async function addOrRemoveUserFromSection(func: "addUserToSection" | "removeUserFromSection", req: Request, res: Response) {
  const vermietung = await store.getVermietung(req.params.url);
  if (!vermietung) {
    return res.sendStatus(404);
  }
  vermietung.staff[func](req.user as User, req.body.section);
  return saveAndReply(req, res, vermietung);
}

app.post("/vermietungen/:url/addUserToSection", async (req: Request, res: Response) => {
  return addOrRemoveUserFromSection("addUserToSection", req, res);
});

app.post("/vermietungen/:url/removeUserFromSection", async (req: Request, res: Response) => {
  return addOrRemoveUserFromSection("removeUserFromSection", req, res);
});

export default app;
