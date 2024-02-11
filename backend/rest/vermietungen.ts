import express, { Request, Response } from "express";

import Vermietung from "jc-shared/vermietung/vermietung.js";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import User from "jc-shared/user/user.js";

import { resToJson } from "../lib/commons/replies.js";
import store from "../lib/vermietungen/vermietungenstore.js";
import { checkOrgateam } from "./checkAccessHandlers.js";
import { vermietungVertragToBuchhaltung } from "../lib/pdf/pdfGeneration.js";

const app = express();

async function standardHandler(req: Request, res: Response, vermietungen: Vermietung[]) {
  if (!(req.user as User).accessrights.isOrgaTeam) {
    return resToJson(res, []);
  }
  resToJson(
    res,
    vermietungen.map((v) => v.toJSON()),
  );
}

async function saveAndReply(res: Response, vermietung: Vermietung) {
  const result = await store.saveVermietung(vermietung);
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
  const user = req.user as User;
  const url = req.body.url;

  if (user.accessrights.isOrgaTeam) {
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
    return saveAndReply(res, new Vermietung(req.body));
  } else {
    return res.status(403).send("Vermietungen brauchen Orga Rechte");
  }
});

app.delete("/vermietungen", [checkOrgateam], async (req: Request, res: Response) => {
  await store.deleteVermietungById(req.body.id);
  resToJson(res);
});

export default app;
