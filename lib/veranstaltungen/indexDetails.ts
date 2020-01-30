import path from "path";
import fs from "fs";
import express from "express";

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
const uploadDir = path.join(__dirname, "../../public/upload");
const filesDir = path.join(__dirname, "../../public/files");
const publicUrlPrefix = conf.get("publicUrlPrefix");

const printoptions: PDFOptions = {
  format: "A4",
  landscape: false, // portrait or landscape
  scale: 1.1,
  margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" }
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
      return store.saveVeranstaltung(veranstaltung, (err1: Error | null) => {
        if (err1) {
          return next(err1);
        }
        return res.redirect("/veranstaltungen/" + veranstaltung.url + "/allgemeines");
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
          Vertrag
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
            allUsers: users.map(user => user.id)
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
          optionen: optionen
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
          optionen: optionen
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
          optionen: optionen
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
            publicUrlPrefix: publicUrlPrefix
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
    return veranstaltungenService.alleBildNamen((err: Error | null, bildernamen: Array<string | null>) => {
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
          bildernamen
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
      return res.send(veranstaltung.presseTextHTML(req.query.text, req.query.jazzclubURL));
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

  app.post("/submit", (req, res, next) => {
    const body = req.body;

    if (!(res.locals.accessrights.isOrgaTeam() || (body.kasse && res.locals.accessrights.isAbendkasse()))) {
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
      if (files.datei) {
        const datei = files.datei[0];
        const dateiname = datei.originalFilename.replace(/[()]/g, "_");
        const istPressefoto = fields.typ[0] === "pressefoto";
        const pfad = datei.path;
        return copyFile(pfad, path.join(istPressefoto ? uploadDir : filesDir, dateiname), errC => {
          if (errC) {
            return res.send({ error: errC });
          }
          return store.getVeranstaltungForId(fields.id[0], (err1: Error | null, veranstaltung?: Veranstaltung) => {
            if (err1) {
              return res.send({ error: err1 });
            }
            if (!veranstaltung) {
              return res.send({ error: "technisches Problem" });
            }
            if (istPressefoto) {
              if (!veranstaltung.presse.updateImage(dateiname)) {
                return res.send({
                  error: "Datei schon vorhanden. Bitte Seite neu laden."
                });
              }
            }
            if (fields.typ[0] === "vertrag") {
              if (!veranstaltung.vertrag.updateDatei(dateiname)) {
                return res.send({
                  error: "Datei schon vorhanden. Bitte Seite neu laden."
                });
              }
            }
            if (fields.typ[0] === "rider") {
              if (!veranstaltung.technik.updateDateirider(dateiname)) {
                return res.send({
                  error: "Datei schon vorhanden. Bitte Seite neu laden."
                });
              }
            }
            return store.saveVeranstaltung(veranstaltung, (err2: Error | null) => {
              if (err2) {
                return res.send({ error: err2 });
              }
              return res.send({});
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
}
