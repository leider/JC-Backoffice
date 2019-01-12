const conf = require('simple-configure');
const Form = require('multiparty').Form;

const fs = require('fs');
const path = require('path');

const beans = conf.get('beans');

const optionenService = beans.get('optionenService');
const userstore = beans.get('userstore');
const store = beans.get('veranstaltungenstore');
const veranstaltungenService = beans.get('veranstaltungenService');
const Veranstaltung = beans.get('veranstaltung');
const Vertrag = beans.get('vertrag');
const statusmessage = beans.get('statusmessage');
const puppeteerPrinter = beans.get('puppeteerPrinter');

const uploadDir = path.join(__dirname, '../../public/upload');
const filesDir = path.join(__dirname, '../../public/files');

const publicUrlPrefix = conf.get('publicUrlPrefix');

const printoptions = {
  format: 'A4',
  landscape: false, // portrait or landscape
  scale: 1.1,
  margin: {top: '10mm', bottom: '10mm', left: '10mm', right: '10mm'}
};

function addRoutesTo(app) {

  function copyFile(src, dest, callback) {
    const readStream = fs.createReadStream(src);
    readStream.once('error', callback);
    readStream.once('end', callback);
    readStream.pipe(fs.createWriteStream(dest));
  }

  app.get('/:url', (req, res, next) => {
    veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err, veranstaltung) => {
      if (err) { return next(err); }
      if (!veranstaltung) {
        if (!res.locals.accessrights.isOrgaTeam()) {
          return res.redirect('/teamseite');
        }
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      userstore.allUsers((err1, users) => {
        if (err1) { return next(err1); }
        veranstaltung.staff().enrichUsers(users);
        res.render('preview', {veranstaltung});
      });
    });
  });

  app.get('/:url/preview', (req, res) => {
    return res.redirect('/veranstaltungen/' + encodeURIComponent(req.params.url));
  });

  app.get('/:url/copy', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
      if (err) { return next(err); }
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      veranstaltung.reset();
      store.saveVeranstaltung(veranstaltung, err1 => {
        if (err1) { return next(err1); }
        res.redirect('/veranstaltungen/' + veranstaltung.url() + '/allgemeines');
      });
    });
  });

  app.get('/deleteVeranstaltungDialog/:url', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }
    store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
      if (err) { return next(err); }
      res.render('edit/deleteVeranstaltungDialog', {veranstaltung});
    });
  });

  app.get('/:url/delete', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    store.deleteVeranstaltung(req.params.url, err => {
      if (err) { return next(err); }
      res.redirect('/veranstaltungen/zukuenftige');
    });
  });

  app.get('/:url/allgemeines', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    optionenService.optionenUndOrte((err, optionen, orte) => {
      if (err) { return next(err); }
      store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
        if (err1) { return next(err1); }
        if (!veranstaltung) {
          return res.redirect('/veranstaltungen/zukuenftige');
        }
        res.render('edit/allgemeines', {veranstaltung: veranstaltung, optionen, orte, Vertrag});
      });
    });
  });

  app.get('/:url/ausgaben', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    optionenService.optionen((err, optionen) => {
      if (err) { return next(err); }
      store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
        if (err1) { return next(err1); }
        if (!veranstaltung) {
          return res.redirect('/veranstaltungen/zukuenftige');
        }
        userstore.allUsers((err2, users) => {
          res.render('edit/ausgaben', {
            veranstaltung, optionen,
            allUsers: users.map(user => user.id)
          });
        });
      });
    });
  });

  app.get('/:url/hotel', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    optionenService.optionen((err, optionen) => {
      if (err) { return next(err); }
      store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
        if (err1) { return next(err1); }
        if (!veranstaltung) {
          return res.redirect('/veranstaltungen/zukuenftige');
        }
        res.render('edit/hotel', {
          veranstaltung: veranstaltung,
          optionen: optionen,
        });
      });
    });
  });

  app.get('/:url/kasse', (req, res, next) => {
    if (!res.locals.accessrights.isAbendkasse()) {
      return res.redirect('/');
    }

    optionenService.optionen((err, optionen) => {
      if (err) { return next(err); }
      veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err1, veranstaltung) => {
        if (err1) { return next(err1); }
        if (!veranstaltung) {
          return res.redirect('/veranstaltungen/zukuenftige');
        }
        res.render('edit/kasse', {veranstaltung: veranstaltung, optionen: optionen});
      });
    });
  });

  app.get('/:url/technik', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    optionenService.optionen((err, optionen) => {
      if (err) { return next(err); }
      veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err1, veranstaltung) => {
        if (err1) { return next(err1); }
        if (!veranstaltung) {
          return res.redirect('/veranstaltungen/zukuenftige');
        }
        res.render('edit/technik', {veranstaltung: veranstaltung, optionen: optionen});
      });
    });
  });

  app.get('/:url/kassenzettel', (req, res, next) => {
    if (!res.locals.accessrights.isAbendkasse()) {
      return res.redirect('/');
    }

    veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err, veranstaltung) => {
      if (err) { return next(err); }
      userstore.forId(veranstaltung.staff().kasseV()[0], (err1, user) => {
        if (!veranstaltung) {
          return res.redirect('/veranstaltungen/zukuenftige');
        }
        const kassierer = user && user.name;
        app.render('pdf/kassenzettel', {
          veranstaltung: veranstaltung,
          kassierer: kassierer,
          publicUrlPrefix: publicUrlPrefix
        }, puppeteerPrinter.generatePdf(printoptions, res, next));
      });
    });
  });

  app.get('/:url/presse', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }
    veranstaltungenService.alleBildNamen((err, bildernamen) => {
      store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
        if (err1) { return next(err1); }
        if (!veranstaltung) {
          return res.redirect('/veranstaltungen/zukuenftige');
        }
        bildernamen.unshift(null);
        res.render('edit/presse', {veranstaltung: veranstaltung, bildernamen});
      });
    });
  });

  app.get('/:url/pressePreview', (req, res, next) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
      if (err1) { return next(err1); }
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      res.send(veranstaltung.presseTextHTML(req.query.text, req.query.jazzclubURL));
    });
  });

  app.get('/:url/kassenfreigabe', (req, res, next) => {
    if (!res.locals.accessrights.darfKasseFreigeben()) {
      return res.redirect('/');
    }

    store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
      veranstaltung.kasse().freigabeErfolgtDurch(res.locals.accessrights.member().name);
      store.saveVeranstaltung(veranstaltung, err1 => {
        if (err1) { return next(err1); }
        res.redirect(veranstaltung.fullyQualifiedUrl() + '/kasse');
      });
    });
  });

  app.get('/:url/kassenfreigaberuckgaengig', (req, res, next) => {
    if (!res.locals.accessrights.darfKasseFreigeben()) {
      return res.redirect('/');
    }

    store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
      veranstaltung.kasse().freigabeRueckgaengig();
      store.saveVeranstaltung(veranstaltung, err1 => {
        if (err1) { return next(err1); }
        res.redirect(veranstaltung.fullyQualifiedUrl() + '/kasse');
      });
    });
  });

  app.post('/submit', (req, res, next) => {
    const body = req.body;

    if (!(res.locals.accessrights.isOrgaTeam() || body.kasse && res.locals.accessrights.isAbendkasse())) {
      return res.redirect('/');
    }

    store.getVeranstaltungForId(body.id, (err, result) => {
      if (err) { return next(err); }
      const veranstaltung = result || new Veranstaltung();
      veranstaltung.fillFromUI(body);
      store.saveVeranstaltung(veranstaltung, err1 => {
        if (err1) { return next(err1); }
        optionenService.saveStuffFromVeranstaltung(body, err2 => {
          if (err2) { return next(err2); }
          statusmessage.successMessage('Gespeichert', 'Deine Änderungen wurden gespeichert').putIntoSession(req);
          res.redirect(veranstaltung.fullyQualifiedUrl() + '/' + (body.returnTo || ''));
        });
      });
    });
  });

  app.post('/upload', (req, res) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    new Form().parse(req, (err, fields, files) => {
      if (err) { return res.send({error: err}); }
      if (files.datei) {
        const datei = files.datei[0];
        const dateiname = datei.originalFilename.replace(/[()]/g, '_');
        const istPressefoto = fields.typ[0] === 'pressefoto';
        const pfad = datei.path;
        copyFile(pfad, path.join((istPressefoto ? uploadDir : filesDir), dateiname), errC => {
          if (errC) { return res.send({error: errC}); }
          store.getVeranstaltungForId(fields.id[0], (err1, veranstaltung) => {
            if (err1) { return res.send({error: err1}); }
            if (istPressefoto) {
              if (!veranstaltung.presse().updateImage(dateiname)) {
                return res.send({error: 'Datei schon vorhanden. Bitte Seite neu laden.'});
              }
            }
            if (fields.typ[0] === 'vertrag') {
              if (!veranstaltung.vertrag().updateDatei(dateiname)) {
                return res.send({error: 'Datei schon vorhanden. Bitte Seite neu laden.'});
              }
            }
            if (fields.typ[0] === 'rider') {
              if (!veranstaltung.technik().updateDateirider(dateiname)) {
                return res.send({error: 'Datei schon vorhanden. Bitte Seite neu laden.'});
              }
            }
            store.saveVeranstaltung(veranstaltung, err2 => {
              if (err2) { return res.send({error: err2}); }
              res.send({});
            });
          });
        });
      } else {
        res.send({error: 'keine Datei'});
      }
    });
  });

  app.post('/deletefile', (req, res) => {
    if (!res.locals.accessrights.isOrgaTeam()) {
      return res.redirect('/');
    }

    const body = req.body;
    const filename = decodeURIComponent(body.key);
    const istPressefoto = body.typ === 'pressefoto';

    store.getVeranstaltungForId(body.id, (err1, veranstaltung) => {
      if (err1) { return res.send({error: err1}); }
      if (istPressefoto) {
        veranstaltung.presse().removeImage(filename);
      }
      if (body.typ === 'vertrag') {
        veranstaltung.vertrag().removeDatei(filename);
      }
      if (body.typ === 'rider') {
        veranstaltung.technik().removeDateirider(filename);
      }
      store.saveVeranstaltung(veranstaltung, err2 => {
        if (err2) { return res.send({error: err2}); }
        res.send({});
      });
    });

  });
}

module.exports = {addRoutesTo};
