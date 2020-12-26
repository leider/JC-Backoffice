import express, { Request, Response } from "express";
import { Form } from "multiparty";
import fs from "fs";
import path from "path";
import async from "async";

import Veranstaltung from "../../shared/veranstaltung/veranstaltung";
import DatumUhrzeit from "../../shared/commons/DatumUhrzeit";
import Kasse from "../../shared/veranstaltung/kasse";
import User from "../../shared/user/user";

import { reply } from "../lib/commons/replies";
import veranstaltungenService from "../lib/veranstaltungen/veranstaltungenService";
import store from "../lib/veranstaltungen/veranstaltungenstore";
import { salesreportFor } from "../lib/reservix/reservixService";
import Salesreport from "../../shared/veranstaltung/salesreport";

const app = express();

function standardCallback(res: Response, user?: User): Function {
  return (err: Error, veranstaltungen: Veranstaltung[]) => {
    function associateReservix(veranstaltung: Veranstaltung, callback: Function): void {
      const reservixID = veranstaltung.reservixID;
      if (reservixID && (!veranstaltung.salesreport || !veranstaltung.salesreport.istVergangen())) {
        salesreportFor(reservixID, (salesreport?: Salesreport) => {
          veranstaltung.associateSalesreport(salesreport);
          store.saveVeranstaltung(veranstaltung, (err: Error | null) => {
            callback(err, veranstaltung);
          });
        });
      } else {
        callback(null, veranstaltung);
      }
    }
    if (err) {
      return reply(res, err);
    }

    const result = veranstaltungenService.filterUnbestaetigteFuerJedermann(veranstaltungen, user);
    async.each(result, associateReservix, (err1) => {
      reply(
        res,
        err1,
        result.map((v) => v.toJSON())
      );
    });
  };
}

function saveAndReply(res: Response, veranstaltung: Veranstaltung) {
  store.saveVeranstaltung(veranstaltung, (err: Error) => {
    reply(res, err, veranstaltung);
  });
}

app.get("/veranstaltungen/vergangene", (req, res) => {
  store.vergangene(standardCallback(res, req.user as User));
});

app.get("/veranstaltungen/zukuenftige", (req, res) => {
  store.zukuenftigeMitGestern(standardCallback(res, req.user as User));
});

app.get("/veranstaltungen/alle", (req, res) => {
  store.alle(standardCallback(res, req.user as User));
});

app.get("/veranstaltungen/:startYYYYMM/:endYYYYMM", (req, res) => {
  const start = DatumUhrzeit.forYYYYMM(req.params.startYYYYMM);
  const end = DatumUhrzeit.forYYYYMM(req.params.endYYYYMM);
  store.byDateRangeInAscendingOrder(start, end, standardCallback(res, req.user as User));
});

app.get("/veranstaltungen/:url", (req: Request, res: Response) => {
  store.getVeranstaltung(req.params.url, (err?: Error, veranstaltung?: Veranstaltung) => {
    if (!err && !veranstaltung) {
      res.sendStatus(404);
      return;
    }
    reply(res, err, veranstaltung);
  });
});

app.post("/veranstaltungen", (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isAbendkasse) {
    return res.sendStatus(403);
  }
  if ((req.user as User)?.accessrights?.isOrgaTeam) {
    saveAndReply(res, new Veranstaltung(req.body));
  } else {
    // Nur Kasse erlaubt
    const url = req.body.url;
    if (!url) {
      return res.status(403).send("Kasse darf nur bestehende speichern");
    }
    store.getVeranstaltung(url, (err?: Error, veranstaltung?: Veranstaltung) => {
      if (!err || !veranstaltung) {
        return res.status(500).send(err?.message || "Keine Veranstaltung gefunden");
      }
      veranstaltung.kasse = new Kasse(req.body.kasse);
      saveAndReply(res, veranstaltung);
    });
  }
});

app.delete("/veranstaltungen", (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  store.deleteVeranstaltungById(req.body.id, (err?: Error) => {
    reply(res, err);
  });
});

function addOrRemoveUserFromSection(func: "addUserToSection" | "removeUserFromSection", req: Request, res: Response): void {
  store.getVeranstaltung(req.params.url, (err?: Error, veranstaltung?: Veranstaltung) => {
    if (err || !veranstaltung) {
      return res.status(500).send(err);
    }
    veranstaltung.staff[func](req.user as User, req.body.section);
    return saveAndReply(res, veranstaltung);
  });
}

app.post("/veranstaltungen/:url/addUserToSection", (req: Request, res: Response) => {
  addOrRemoveUserFromSection("addUserToSection", req, res);
});

app.post("/veranstaltungen/:url/removeUserFromSection", (req: Request, res: Response) => {
  addOrRemoveUserFromSection("removeUserFromSection", req, res);
});

app.post("/upload", (req: Request, res: Response) => {
  if (!(req.user as User)?.accessrights?.isOrgaTeam) {
    return res.sendStatus(403);
  }
  const uploadDir = path.join(__dirname, "../static/upload");
  const filesDir = path.join(__dirname, "../static/files");

  // eslint-disable-next-line no-unused-vars
  function copyFile(src: string, dest: string, callback: (err: Error) => void): void {
    const readStream = fs.createReadStream(src);
    readStream.once("error", callback);
    readStream.once("end", callback);
    readStream.pipe(fs.createWriteStream(dest));
  }

  return new Form().parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).send(err.message);
    }
    const typElement = fields.typ[0];
    const idElement = fields.id[0];
    const istPressefoto = typElement === "pressefoto";

    if (files.datei) {
      return store.getVeranstaltungForId(idElement, (err1?: Error, veranstaltung?: Veranstaltung) => {
        if (err1) {
          return res.status(500).send(err1.message);
        }
        if (!veranstaltung) {
          return res.sendStatus(500);
        }

        function copyToDestination(datei: { originalFilename: string; path: string }, callback: Function): void {
          const dateiname = datei.originalFilename.replace(/[()/]/g, "_");
          const pfad = datei.path;
          copyFile(pfad, path.join(istPressefoto ? uploadDir : filesDir, dateiname), (errC) => {
            if (errC || !veranstaltung) {
              return callback(errC);
            }
            let result = true;
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
              return callback({ message: "Datei schon vorhanden. Bitte Seite neu laden." });
            }
            return callback();
          });
        }

        async.forEach(files.datei, copyToDestination, (err) => {
          if (err) {
            return res.status(500).send(err.message);
          }
          saveAndReply(res, veranstaltung);
        });
      });
    } else {
      res.status(500).send("keine Datei");
    }
  });
});

export default app;
