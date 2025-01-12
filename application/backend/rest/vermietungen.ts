import express, { NextFunction, Request, Response } from "express";

import Vermietung from "jc-shared/vermietung/vermietung.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import User from "jc-shared/user/user.js";

import { resToJson } from "../lib/commons/replies.js";
import store from "../lib/vermietungen/vermietungenstore.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import { saveVermietungToShare, vermietungVertragToBuchhaltung } from "../lib/pdf/pdfGeneration.js";
import vermietungenService from "../lib/vermietungen/vermietungenService.js";
import invokeMap from "lodash/invokeMap.js";

const app = express();

async function standardHandler(req: Request, res: Response, vermietungen: Vermietung[]) {
  const user: User = req.user as User;
  resToJson(res, invokeMap(vermietungenService.filterUnbestaetigteFuerJedermann(vermietungen, user), "toJSON"));
}

function saveAndReply(req: Request, res: Response, vermietung: Vermietung) {
  resToJson(res, store.saveVermietung(vermietung, req.user as User));
}

app.get("/vermietungen/vergangene", (req, res) => {
  standardHandler(req, res, store.vergangene());
});

app.get("/vermietungen/zukuenftige", (req, res) => {
  standardHandler(req, res, store.zukuenftigeMitGestern());
});

app.get("/vermietungen/alle", (req, res) => {
  standardHandler(req, res, store.alle());
});

app.get("/vermietungen/:startYYYYMM/:endYYYYMM", (req, res) => {
  const start = DatumUhrzeit.forYYYYMM(req.params.startYYYYMM);
  const end = DatumUhrzeit.forYYYYMM(req.params.endYYYYMM);
  standardHandler(req, res, store.byDateRangeInAscendingOrder(start, end));
});

app.get("/vermietung/:url", (req: Request, res: Response) => {
  const vermietung = store.getVermietung(req.params.url);
  if (!vermietung) {
    return res.sendStatus(404);
  }
  resToJson(res, vermietung);
});

app.post("/vermietung", [checkOrgateam], async (req: Request, res: Response, next: NextFunction) => {
  const vermSaved = store.getVermietung(req.body.url);
  const vermietung = new Vermietung(req.body);
  if (vermSaved) {
    const frischFreigegeben = vermSaved.angebot.freigabe !== vermietung.angebot.freigabe && !!vermietung.angebot.freigabe;
    if (frischFreigegeben) {
      try {
        await Promise.all([vermietungVertragToBuchhaltung(vermietung), saveVermietungToShare(vermietung)]);
      } catch {
        return next(new Error("Vermietungsvertrag Versand an Buchhaltung gescheitert"));
      }
    }
  }
  return saveAndReply(req, res, vermietung);
});

app.delete("/vermietung", [checkOrgateam], (req: Request, res: Response) => {
  store.deleteVermietungById(req.body.id, req.user as User);
  resToJson(res);
});

function addOrRemoveUserFromSection(func: "addUserToSection" | "removeUserFromSection", req: Request, res: Response) {
  const vermietung = store.getVermietung(req.params.url);
  if (!vermietung) {
    return res.sendStatus(404);
  }
  vermietung.staff[func](req.user as User, req.body.section);
  saveAndReply(req, res, vermietung);
}

app.post("/vermietung/:url/addUserToSection", (req: Request, res: Response) => {
  return addOrRemoveUserFromSection("addUserToSection", req, res);
});

app.post("/vermietung/:url/removeUserFromSection", (req: Request, res: Response) => {
  return addOrRemoveUserFromSection("removeUserFromSection", req, res);
});

export default app;
