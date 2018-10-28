const conf = require('simple-configure');
const R = require('ramda');
const async = require('async');
const moment = require('moment-timezone');
const Form = require('multiparty').Form;

const fs = require('fs');
const path = require('path');

const beans = conf.get('beans');
const misc = beans.get('misc');
const fieldHelpers = beans.get('fieldHelpers');

const optionenService = beans.get('optionenService');
const userstore = beans.get('userstore');
const store = beans.get('veranstaltungenstore');
const veranstaltungenService = beans.get('veranstaltungenService');
const Veranstaltung = beans.get('veranstaltung');
const Vertrag = beans.get('vertrag');
const hotelMails = beans.get('hotelMails');
const statusmessage = beans.get('statusmessage');
const reservixService = beans.get('reservixService');
const terminstore = beans.get('terminstore');
const mailtransport = beans.get('mailtransport');
const puppeteerPrinter = beans.get('puppeteerPrinter');

const app = misc.expressAppIn(__dirname);

const uploadDir = path.join(__dirname, '../../public/upload');
const filesDir = path.join(__dirname, '../../public/files');

const hotelMailReceiver = conf.get('hotelMailReceiver');
const publicUrlPrefix = conf.get('publicUrlPrefix');
// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

const printoptions = {
  format: 'A4',
  landscape: false, // portrait or landscape
  scale: 1.1,
  margin: {top: '10mm', bottom: '10mm', left: '10mm', right: '10mm'}
};

function copyFile(src, dest, callback) {
  const readStream = fs.createReadStream(src);
  readStream.once('error', callback);
  readStream.once('end', callback);
  readStream.pipe(fs.createWriteStream(dest));
}

function filterUnbestaetigteFuerJedermann(veranstaltungen, res) {
  if (res.locals.accessrights.isBookingTeam()) {
    return veranstaltungen;
  }
  return veranstaltungen.filter(v => v.kopf().confirmed());
}

function veranstaltungenForDisplay(fetcher, next, res, titel) {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  function associateReservix(veranstaltung, callback) {
    if (veranstaltung.reservixID()) {
      reservixService.salesreportFor(veranstaltung.reservixID(), salesreport => {
        veranstaltung.associateSalesreport(salesreport);
        if (salesreport.istVergangen()) {
          store.saveVeranstaltung(veranstaltung, err => {
            return callback(err, veranstaltung);
          });
        } else {
          callback(null, veranstaltung);
        }
      });
    } else {
      callback(null, veranstaltung);
    }
  }

  return fetcher((err, veranstaltungen) => {
    if (err) { return next(err); }
    async.each(veranstaltungen, associateReservix, err1 => {
      if (err1) { return next(err1); }
      res.render('liste', {
        titel: titel,
        veranstaltungen: filterUnbestaetigteFuerJedermann(veranstaltungen, res),
        webcalURL: conf.get('publicUrlPrefix').replace(/https|http/, 'webcal') + '/ical/'
      });
    });
  });
}

function isValidUrl(reservedURLs, url, callback) {
  const isReserved = new RegExp(reservedURLs, 'i').test(url);
  if (fieldHelpers.containsSlash(url) || isReserved) { return callback(null, false); }
  store.getVeranstaltung(url, (err, result) => {
    if (err) { return callback(err); }
    callback(null, result === null);
  });
}

function eventsBetween(startMoment, endMoment, res, callback) {
  function asCalendarEvent(veranstaltung) {
    return {
      start: veranstaltung.startMoment().format(),
      end: veranstaltung.endMoment().format(),
      url: veranstaltung.fullyQualifiedUrl(),
      title: veranstaltung.kopf().titel(),
      tooltip: veranstaltung.tooltipInfos(),
      className: (!veranstaltung.kopf().confirmed() ? 'color-geplant ' : '') +
        'verySmall color-' + veranstaltung.kopf().cssColorCode()
    };
  }

  store.byDateRangeInAscendingOrder(startMoment, endMoment, (err, veranstaltungen) => {
    if (err) { return callback(err); }
    terminstore.termineBetween(startMoment, endMoment, (err2, termine) => {
      const terminEvents = termine.map(termin => {
        return {
          start: termin.startMoment().format(),
          end: termin.endMoment().format(),
          title: termin.beschreibung(),
          tooltip: termin.beschreibung()
        };
      });
      if (err2) { return callback(err2); }
      callback(null, R.concat(filterUnbestaetigteFuerJedermann(veranstaltungen, res).map(asCalendarEvent), terminEvents));
    });
  });
}

app.get('/', (req, res) => res.redirect('/veranstaltungen/zukuenftige'));

app.get('/zukuenftige', (req, res, next) => veranstaltungenForDisplay(store.zukuenftige, next, res, 'Zukünftige'));

app.get('/vergangene', (req, res, next) => veranstaltungenForDisplay(store.vergangene, next, res, 'Vergangene'));

app.get('/checkurl', (req, res) => misc.validate(req.query.url, req.query.previousUrl, R.partial(isValidUrl, ['^new|^zukuenftige|^vergangene']), res.end));

app.get('/new', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  optionenService.optionenUndOrte((err, optionen, orte) => {
    if (err) { return next(err); }
    res.render('edit', {veranstaltung: new Veranstaltung(), optionen, orte, Vertrag});
  });
});

app.get('/monat/:monat', (req, res, next) => {
  const monat = req.params.monat; // kommt als YYMM
  const start = moment(monat + '01', 'YYMMDD');
  const end = start.clone();
  end.add(1, 'M');
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) { return next(err); }
    res.render('monatsliste', {liste: result, monat});
  });
});

app.get('/imgzip/:monat', (req, res, next) => {
  const monat = req.params.monat; // kommt als YYMM
  const start = moment(monat + '01', 'YYMMDD');
  const end = start.clone();
  end.add(1, 'M');
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) { return next(err); }
    const images = R.flatten(result.map(veranst => veranst.presse().image()))
                    .map(filename => { return {path: uploadDir + '/' + filename, name: filename};});
    res.zip(images, 'Jazzclub Bilder ' + start.format('MMM \'YY') + '.zip');
  });
});

app.get('/texte/:monat', (req, res, next) => {
  const monat = req.params.monat; // kommt als YYMM
  const start = moment(monat + '01', 'YYMMDD');
  const end = start.clone();
  end.add(1, 'M');
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) { return next(err); }
    res.render('pressetexte', {liste: result, monat});
  });
});

app.get('/eventsForCalendar', (req, res, next) => {
  const start = moment(req.query.start).utc();
  const end = moment(req.query.end).utc();
  eventsBetween(start, end, res, (err1, events) => {
    if (err1) { return next(err1); }
    res.end(JSON.stringify(events));
  });
});

app.get('/:url', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  veranstaltungenService.getVeranstaltungMitReservix(req.params.url, (err, veranstaltung) => {
    if (err) { return next(err); }
    if (!veranstaltung) {
      return res.redirect('/veranstaltungen/zukuenftige');
    }
    userstore.allUsers((err1, users) => {
      if (err1) { return next(err1); }
      veranstaltung.staff().enrichUsers(users);
      res.render('overview', {veranstaltung});
    });
  });
});

app.get('/:url/preview', (req, res, next) => {
  store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
    if (err) { return next(err); }
    if (!veranstaltung) {
      return res.redirect('/teamseite');
    }
    userstore.allUsers((err1, users) => {
      if (err1) { return next(err1); }
      veranstaltung.staff().enrichUsers(users);
      res.render('preview', {veranstaltung});
    });
  });
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
      res.redirect('/veranstaltungen/' + veranstaltung.url() + '/kopf');
    });
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

app.get('/:url/kopf', (req, res, next) => {
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
      res.render('edit', {veranstaltung: veranstaltung, optionen, orte, Vertrag});
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
        res.render('ausgaben', {
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
      res.render('hotel', {veranstaltung: veranstaltung, optionen: optionen, hotelMailReceiver: hotelMailReceiver});
    });
  });
});

app.get('/:url/kasse', (req, res, next) => {
  if (!res.locals.accessrights.isAbendkasse()) {
    return res.redirect('/');
  }

  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }
    store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
      if (err1) { return next(err1); }
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      res.render('kasse', {veranstaltung: veranstaltung, optionen: optionen});
    });
  });
});

app.get('/:url/kassenzettel', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
    if (err) { return next(err); }
    userstore.forId(veranstaltung.staff().kasseV()[0], (err1, user) => {
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      const kassierer = user && user.name;
      //res.render('kassenzettel', {veranstaltung: veranstaltung, kassierer: kassierer});
      app.render('kassenzettel', {
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
      res.render('presse', {veranstaltung: veranstaltung, bildernamen});
    });
  });
});

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

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

app.get('/:url/hotelMail/:mailart', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }
  const currentUser = res.locals.accessrights.member();
  const mailart = req.params.mailart;

  store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
    if (err1) { return next(err1); }
    if (!veranstaltung) {
      return res.redirect('/veranstaltungen/zukuenftige');
    }

    function handleMailCreation(checkAngefragt, err, message) {
      if (err) {
        statusmessage.errorMessage('Keine Mail gesendet', err.message).putIntoSession(req);
        return res.redirect('/veranstaltungen/' + veranstaltung.url() + '/hotel');
      }
      mailtransport.sendMail(message, err2 => {
        if (err2) { return next(err2); }
        statusmessage.successMessage('Mail gesendet', 'Es wurde eine E-Mail an ' + message.to + ' geschickt.')
                     .putIntoSession(req);
        if (checkAngefragt) {
          const step = veranstaltung.unterkunft().workflow()[0];
          veranstaltung.unterkunft().checkStep(step);
          return store.saveVeranstaltung(veranstaltung, err3 => {
            if (err3) { return next(err3); }
            res.redirect('/veranstaltungen/' + veranstaltung.url() + '/hotel');
          });
        }
        res.redirect('/veranstaltungen/' + veranstaltung.url() + '/hotel');
      });
    }

    if (mailart === 'reminder') {
      return hotelMails.createReminder(veranstaltung, currentUser, R.partial(handleMailCreation, [false]));
    }
    hotelMails.createReservation(veranstaltung, currentUser, mailart, R.partial(handleMailCreation, [mailart === 'reservation']));
  });
});

app.get('/:url/hotelStepClicked', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  const step = req.query.step;
  const checked = req.query.checked;
  store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
    if (checked === 'true') {
      veranstaltung.unterkunft().checkStep(step);
    } else {
      veranstaltung.unterkunft().uncheckStep(step);
    }
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1) { return next(err1); }
      res.send(true);
    });
  });
});

app.get('/:url/vertragStepClicked', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  const step = req.query.step;
  const checked = req.query.checked;
  store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
    if (checked === 'true') {
      veranstaltung.vertrag().checkStep(step);
    } else {
      veranstaltung.vertrag().uncheckStep(step);
    }
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1) { return next(err1); }
      res.send(true);
    });
  });
});

app.get('/:url/genehmigungenEingeholt', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  const checked = req.query.checked;
  store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
    veranstaltung.werbung().genehmigungErfolgt(checked === 'true');
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1) { return next(err1); }
      res.send(true);
    });
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
        res.redirect(body.returnTo && body.returnTo[0] || veranstaltung.fullyQualifiedUrl());
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
            if (!veranstaltung.kosten().updateDateirider(dateiname)) {
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
      veranstaltung.kosten().removeDateirider(filename);
    }
    store.saveVeranstaltung(veranstaltung, err2 => {
      if (err2) { return res.send({error: err2}); }
      res.send({});
    });
  });

});

module.exports = app;
