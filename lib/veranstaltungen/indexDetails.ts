import path from "path";
import fs from "fs";
import express, { Request, Response } from "express";

import { Form } from "multiparty";
import optionenService from "../optionen/optionenService";
import userstore from "../users/userstore";
import store from "./veranstaltungenstore";
import veranstaltungenService from "./veranstaltungenService";
import Veranstaltung from "./object/veranstaltung";
import Vertrag from "./object/vertrag";
import statusmessage from "../commons/statusmessage";
import puppeteerPrinter from "../commons/puppeteerPrinter";
import User from "../users/user";
import OptionValues from "../optionen/optionValues";
import Orte from "../optionen/orte";
import { PDFOptions } from "puppeteer";

import conf from "../commons/simpleConfigure";
import Renderer from "../commons/renderer";
import imageService from "../image/imageService";
import async from "async";
import Kasse from "./object/kasse";
const uploadDir = path.join(__dirname, "../../static/upload");
const filesDir = path.join(__dirname, "../../static/files");
const publicUrlPrefix = conf.get("publicUrlPrefix");

const printoptions: PDFOptions = {
  format: "A4",
  landscape: false, // portrait or landscape
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
};

export function addRoutesTo(app: express.Express): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function copyFile(src: string, dest: string, callback: (...args: any[]) => void): void {
    const readStream = fs.createReadStream(src);
    readStream.once("error", callback);
    readStream.once("end", callback);
    readStream.pipe(fs.createWriteStream(dest));
  }

  app.get("/:url", (req, res, next) => {
    veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err: Error | null, veranstaltung?: Veranstaltung) => {
      if (err) {
        return next(err);
      }
      if (!veranstaltung) {
        if (!res.locals.accessrights.isOrgaTeam()) {
          return res.redirect("/teamseite");
        }
        return res.redirect("/veranstaltungen/zukuenftige");
      }
      return userstore.allUsers((err1: Error | null, users?: User[]) => {
        if (err1) {
          return next(err1);
        }
        veranstaltung.staff.enrichUsers(users);
        return res.render("preview", { veranstaltung });
      });
    });
  });

  app.get("/:url/preview", (req, res) => {
    return res.redirect("/veranstaltungen/" + encodeURIComponent(req.params.url));
  });

  app.get("/:url/copy", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    return store.getVeranstaltung(req.params.url, (err: Error | null, veranstaltung?: Veranstaltung) => {
      if (err) {
        return next(err);
      }
      if (!veranstaltung) {
        return res.redirect("/veranstaltungen/zukuenftige");
      }
      veranstaltung.reset();

      return optionenService.optionenUndOrte((err: Error | null, optionen: OptionValues, orte: Orte) => {
        if (err) {
          return next(err);
        }
        return res.render("edit/allgemeines", {
          veranstaltung: veranstaltung,
          optionen,
          orte,
          Vertrag,
        });
      });
    });
  });

  app.get("/deleteVeranstaltungDialog/:url", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }
    return store.getVeranstaltung(req.params.url, (err: Error | null, veranstaltung?: Veranstaltung) => {
      if (err) {
        return next(err);
      }
      return res.render("edit/deleteVeranstaltungDialog", { veranstaltung });
    });
  });

  app.get("/:url/delete", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    return store.deleteVeranstaltung(req.params.url, (err: Error | null) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/veranstaltungen/zukuenftige");
    });
  });

  app.get("/:url/allgemeines", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    return optionenService.optionenUndOrte((err: Error | null, optionen: OptionValues, orte: Orte) => {
      if (err) {
        return next(err);
      }
      return store.getVeranstaltung(req.params.url, (err1: Error | null, veranstaltung?: Veranstaltung) => {
        if (err1) {
          return next(err1);
        }
        if (!veranstaltung) {
          return res.redirect("/veranstaltungen/zukuenftige");
        }
        return res.render("edit/allgemeines", {
          veranstaltung: veranstaltung,
          optionen,
          orte,
          Vertrag,
        });
      });
    });
  });

  app.get("/:url/ausgaben", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    return optionenService.optionen((err: Error | null, optionen: OptionValues) => {
      if (err) {
        return next(err);
      }
      return store.getVeranstaltung(req.params.url, (err1: Error | null, veranstaltung?: Veranstaltung) => {
        if (err1) {
          return next(err1);
        }
        if (!veranstaltung) {
          return res.redirect("/veranstaltungen/zukuenftige");
        }
        return userstore.allUsers((err2: Error | null, users: User[]) => {
          res.render("edit/ausgaben", {
            veranstaltung,
            optionen,
            allUsers: users.map((user) => user.id),
          });
        });
      });
    });
  });

  app.get("/:url/hotel", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    return optionenService.optionen((err: Error | null, optionen: OptionValues) => {
      if (err) {
        return next(err);
      }
      return store.getVeranstaltung(req.params.url, (err1: Error | null, veranstaltung?: Veranstaltung) => {
        if (err1) {
          return next(err1);
        }
        if (!veranstaltung) {
          return res.redirect("/veranstaltungen/zukuenftige");
        }
        return res.render("edit/hotel", {
          veranstaltung: veranstaltung,
          optionen: optionen,
        });
      });
    });
  });

  app.get("/:url/kasse", (req, res, next) => {
    if (!res.locals.accessrights.isAbendkasse()) {
      return res.redirect("/");
    }

    return optionenService.optionen((err: Error | null, optionen: OptionValues) => {
      if (err) {
        return next(err);
      }
      return veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err1: Error | null, veranstaltung?: Veranstaltung) => {
        if (err1) {
          return next(err1);
        }
        if (!veranstaltung) {
          return res.redirect("/veranstaltungen/zukuenftige");
        }
        return res.render("edit/kasse", {
          veranstaltung: veranstaltung,
          optionen: optionen,
        });
      });
    });
  });

  app.get("/:url/technik", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    return optionenService.optionen((err: Error | null, optionen: OptionValues) => {
      if (err) {
        return next(err);
      }
      return veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err1: Error | null, veranstaltung?: Veranstaltung) => {
        if (err1) {
          return next(err1);
        }
        if (!veranstaltung) {
          return res.redirect("/veranstaltungen/zukuenftige");
        }
        return res.render("edit/technik", {
          veranstaltung: veranstaltung,
          optionen: optionen,
        });
      });
    });
  });

  app.get("/:url/kassenzettel", (req, res, next) => {
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
        app.render(
          "pdf/kassenzettel",
          {
            veranstaltung: veranstaltung,
            kassierer: kassierer,
            publicUrlPrefix: publicUrlPrefix,
          },
          puppeteerPrinter.generatePdf(printoptions, res, next)
        );
      });
    });
  });

  app.get("/:url/presse", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }
    return imageService.alleBildNamen((err: Error | null, bildernamen: Array<string | null>) => {
      store.getVeranstaltung(req.params.url, (err1: Error | null, veranstaltung?: Veranstaltung) => {
        if (err1) {
          return next(err1);
        }
        if (!veranstaltung) {
          return res.redirect("/veranstaltungen/zukuenftige");
        }
        bildernamen.unshift(null);
        return res.render("edit/presse", {
          veranstaltung: veranstaltung,
          bildernamen,
        });
      });
    });
  });

  app.get("/:url/pressePreview", (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect("/");
    }

    return store.getVeranstaltung(req.params.url, (err1: Error | null, veranstaltung?: Veranstaltung) => {
      if (err1) {
        return next(err1);
      }
      if (!veranstaltung) {
        return res.redirect("/veranstaltungen/zukuenftige");
      }
      const result = Renderer.render(
        veranstaltung.presseTemplate() +
          (req.query.text || veranstaltung.presse.text) +
          "\n\n" +
          veranstaltung.presse.fullyQualifiedJazzclubURL(req.query.jazzclubURL)
      );
      return res.send(result);
    });
  });

  app.get("/:url/kassenfreigabe", (req, res, next) => {
    if (!res.locals.accessrights.darfKasseFreigeben()) {
      return res.redirect("/");
    }

    return store.getVeranstaltung(req.params.url, (err: Error | null, veranstaltung?: Veranstaltung) => {
      if (err) {
        return next(err);
      }
      if (!veranstaltung) {
        return res.redirect("/veranstaltungen/zukuenftige");
      }

      veranstaltung.kasse.freigabeErfolgtDurch(res.locals.accessrights.member().name);
      return store.saveVeranstaltung(veranstaltung, (err1: Error | null) => {
        if (err1) {
          return next(err1);
        }
        return res.redirect(veranstaltung.fullyQualifiedUrl() + "/kasse");
      });
    });
  });

  app.get("/:url/kassenfreigaberuckgaengig", (req, res, next) => {
    if (!res.locals.accessrights.darfKasseFreigeben()) {
      return res.redirect("/");
    }

    return store.getVeranstaltung(req.params.url, (err: Error | null, veranstaltung?: Veranstaltung) => {
      if (err) {
        return next(err);
      }
      if (!veranstaltung) {
        return res.redirect("/veranstaltungen/zukuenftige");
      }

      veranstaltung.kasse.freigabeRueckgaengig();
      return store.saveVeranstaltung(veranstaltung, (err1: Error | null) => {
        if (err1) {
          return next(err1);
        }
        return res.redirect(veranstaltung.fullyQualifiedUrl() + "/kasse");
      });
    });
  });

  app.post("/saveVeranstaltung", (req, res) => {
    if (!res.locals.accessrights.isAbendkasse) {
      return res.redirect("/");
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

  app.post("/deleteVeranstaltung", (req, res, next) => {
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

  app.post("/submit", (req, res, next) => {
    const body = req.body;

    if (!(res.locals.accessrights.isOrgaTeam || (body.kasse && res.locals.accessrights.isAbendkasse))) {
      return res.redirect("/");
    }

    return store.getVeranstaltungForId(body.id, (err: Error | null, result?: Veranstaltung) => {
      if (err) {
        return next(err);
      }
      const veranstaltung = result || new Veranstaltung();
      veranstaltung.fillFromUI(body);
      return store.saveVeranstaltung(veranstaltung, (err1: Error | null) => {
        if (err1) {
          return next(err1);
        }
        return optionenService.saveStuffFromVeranstaltung(body, (err2: Error | null) => {
          if (err2) {
            return next(err2);
          }
          statusmessage.successMessage("Gespeichert", "Deine Änderungen wurden gespeichert").putIntoSession(req);
          return res.redirect(veranstaltung.fullyQualifiedUrl() + "/" + (body.returnTo || ""));
        });
      });
    });
  });

  app.post("/upload", (req, res) => {
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

  app.post("/deletefile", (req, res) => {
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

  app.post("/:url/addUserToSection", (req, res) => {
    addOrRemoveUserFromSection("addUserToSection", req, res);
  });

  app.post("/:url/removeUserFromSection", (req, res) => {
    addOrRemoveUserFromSection("removeUserFromSection", req, res);
  });
}
