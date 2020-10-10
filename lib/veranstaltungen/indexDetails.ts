import path from "path";
import fs from "fs";
import { Express, Request, Response, NextFunction } from "express";

import { Form } from "multiparty";
import userstore from "../users/userstore";
import store from "./veranstaltungenstore";
import veranstaltungenService from "./veranstaltungenService";
import Veranstaltung from "./object/veranstaltung";
import User from "../users/user";

import async from "async";
import Kasse from "./object/kasse";
import { kassenzettelPdf } from "../pdf";
const uploadDir = path.join(__dirname, "../../static/upload");
const filesDir = path.join(__dirname, "../../static/files");

export function addRoutesTo(app: Express): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function copyFile(src: string, dest: string, callback: (...args: any[]) => void): void {
    const readStream = fs.createReadStream(src);
    readStream.once("error", callback);
    readStream.once("end", callback);
    readStream.pipe(fs.createWriteStream(dest));
  }

  app.get("/:url/kassenzettel", (req: Request, res: Response, next: NextFunction) => {
    if (!res.locals.accessrights.isAbendkasse()) {
      return res.redirect("/");
    }

    return veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err: Error | null, veranstaltung?: Veranstaltung) => {
      if (err) {
        return next(err);
      }
      if (!veranstaltung) {
        return res.redirect("/veranstaltungen/zukuenftige");
      }
      return userstore.forId(veranstaltung.staff.kasseV[0], (err1: Error | null, user: User) => {
        const kassierer = user && user.name;
        kassenzettelPdf(veranstaltung, kassierer, res, next);
      });
    });
  });

  app.get("/:url.json", (req: Request, res: Response) => {
    store.getVeranstaltung(req.params.url, (err: Error, veranstaltung: Veranstaltung) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      res.set("Content-Type", "application/json").send(veranstaltung);
    });
  });

  app.post("/saveVeranstaltung", (req: Request, res: Response) => {
    if (!res.locals.accessrights.isAbendkasse) {
      return res.redirect("/"); // ErrorHandling
    }
    if (res.locals.accessrights.isOrgaTeam) {
      const veranstaltung = new Veranstaltung(req.body);
      store.saveVeranstaltung(veranstaltung, (err: Error) => {
        if (err) {
          return res.status(500).send(err);
        }
        res.set("Content-Type", "application/json").send(veranstaltung.toJSON());
      });
    } else {
      // Nur Kasse erlaubt
      const url = req.body.url;
      if (!url) {
        return res.status(500).send("Kasse darf nur bestehende speichern");
      }
      store.getVeranstaltung(url, (err: Error | null, veranstaltung?: Veranstaltung) => {
        if (err || !veranstaltung) {
          return res.status(500).send(err);
        }
        veranstaltung.kasse = new Kasse(req.body.kasse);
        store.saveVeranstaltung(veranstaltung, (err1: Error) => {
          if (err1) {
            return res.status(500).send(err1);
          }
          res.set("Content-Type", "application/json").send(veranstaltung.toJSON());
        });
      });
    }
  });

  app.post("/deleteVeranstaltung", (req: Request, res: Response) => {
    if (!res.locals.accessrights.isOrgaTeam) {
      return res.redirect("/");
    }
    store.deleteVeranstaltungById(req.body.id, (err: Error | null) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.set("Content-Type", "application/json").send({ status: "ok" });
    });
  });

  app.post("/upload", (req: Request, res: Response) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    return new Form().parse(req, (err, fields, files) => {
      if (err) {
        return res.send({ error: err });
      }
      const typElement = fields.typ[0];
      const idElement = fields.id[0];
      const istPressefoto = typElement === "pressefoto";

      if (files.datei) {
        return store.getVeranstaltungForId(idElement, (err1: Error | null, veranstaltung?: Veranstaltung) => {
          if (err1) {
            return res.send({ error: err1 });
          }
          if (!veranstaltung) {
            return res.send({ error: "technisches Problem" });
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
                return callback({ error: "Datei schon vorhanden. Bitte Seite neu laden." });
              }
              return callback();
            });
          }

          async.forEach(files.datei, copyToDestination, (err) => {
            if (err) {
              return res.send({ error: err });
            }
            return store.saveVeranstaltung(veranstaltung, (err2: Error | null) => {
              if (err2) {
                return res.send({ error: err2 });
              }
              return res.set("Content-Type", "application/json").send({ veranstaltung: veranstaltung.toJSON() });
            });
          });
        });
      } else {
        res.send({ error: "keine Datei" });
      }
    });
  });

  app.post("/deletefile", (req: Request, res: Response) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    const body = req.body;
    const filename = decodeURIComponent(body.key);
    const istPressefoto = body.typ === "pressefoto";

    return store.getVeranstaltungForId(body.id, (err1: Error | null, veranstaltung?: Veranstaltung) => {
      if (err1) {
        return res.send({ error: err1 });
      }
      if (!veranstaltung) {
        return res.send({ error: "technisches Problem" });
      }
      if (istPressefoto) {
        veranstaltung.presse.removeImage(filename);
      }
      if (body.typ === "vertrag") {
        veranstaltung.vertrag.removeDatei(filename);
      }
      if (body.typ === "rider") {
        veranstaltung.technik.removeDateirider(filename);
      }
      return store.saveVeranstaltung(veranstaltung, (err2: Error | null) => {
        if (err2) {
          return res.send({ error: err2 });
        }
        return res.send({});
      });
    });
  });

  function addOrRemoveUserFromSection(func: "addUserToSection" | "removeUserFromSection", req: Request, res: Response): void {
    store.getVeranstaltung(req.params.url, (err: Error, veranstaltung: Veranstaltung) => {
      if (err) {
        return res.status(500).send(err);
      }
      veranstaltung.staff[func](req.user as User, req.body.section);
      return store.saveVeranstaltung(veranstaltung, (err1: Error) => {
        if (err1) {
          return res.status(500).send(err1);
        }
        return res.set("Content-Type", "application/json").send(veranstaltung.toJSON());
      });
    });
  }

  app.post("/:url/addUserToSection", (req: Request, res: Response) => {
    addOrRemoveUserFromSection("addUserToSection", req, res);
  });

  app.post("/:url/removeUserFromSection", (req: Request, res: Response) => {
    addOrRemoveUserFromSection("removeUserFromSection", req, res);
  });
}
