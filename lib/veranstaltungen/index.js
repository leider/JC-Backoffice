const conf = require('simple-configure');
const R = require('ramda');
const moment = require('moment-timezone');
const Form = require('multiparty').Form;

const fs = require('fs');
const path = require('path');

const beans = conf.get('beans');
const misc = beans.get('misc');
const fieldHelpers = beans.get('fieldHelpers');

// const service = beans.get('veranstaltungenService');
const optionenService = beans.get('optionenService');
const store = beans.get('veranstaltungenstore');
const Veranstaltung = beans.get('veranstaltung');
const Vertrag = beans.get('vertrag');

const app = misc.expressAppIn(__dirname);

const imageDir = path.join(__dirname, '../../public/upload')

function copyFile(src, dest, callback) {
  const readStream = fs.createReadStream(src);
  readStream.once('error', callback);
  readStream.once('end', callback);
  readStream.pipe(fs.createWriteStream(dest));
}

function veranstaltungenForDisplay(fetcher, next, res, titel) {
  return fetcher((err, veranstaltungen) => {
    if (err) { next(err); }
    if (err) { return next(err); }
    res.render('liste', {titel: titel, veranstaltungen: veranstaltungen});
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

function eventsBetween(startMoment, endMoment, callback) {
  function asCalendarEvent(activity) {
    return {
      start: activity.startMoment().format(),
      end: activity.endMoment().format(),
      url: activity.fullyQualifiedUrl(),
      title: activity.kopf().titel(),
      className: 'verySmall',
      color: '#3377A2'
    };
  }

  store.byDateRangeInAscendingOrder(startMoment, endMoment, (err, activities) => {
    if (err) { return callback(err); }
    callback(null, activities.map(asCalendarEvent));
  });
}

app.get('/', (req, res) => res.redirect('/veranstaltungen/zukuenftige'));

app.get('/zukuenftige', (req, res, next) => veranstaltungenForDisplay(store.zukuenftige, next, res, 'Zukünftige'));

app.get('/vergangene', (req, res, next) => veranstaltungenForDisplay(store.vergangene, next, res, 'Vergangene'));

app.get('/checkurl', (req, res) => misc.validate(req.query.url, req.query.previousUrl, R.partial(isValidUrl, ['^new|^zukuenftige|^vergangene']), res.end));

app.get('/new', (req, res, next) => {
  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }
    res.render('edit', {veranstaltung: new Veranstaltung(), optionen: optionen, Vertrag: Vertrag});
  });
});

app.get('/eventsForCalendar', (req, res, next) => {
  const start = moment(req.query.start).utc();
  const end = moment(req.query.end).utc();
  eventsBetween(start, end, (err1, events) => {
    if (err1) { return next(err1); }
    res.end(JSON.stringify(events));
  });
});

app.get('/:url', (req, res, next) => {
  store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
    if (err) { return next(err); }
    if (!veranstaltung) {
      return res.redirect('/veranstaltungen/zukuenftige');
    }
    res.render('overview', {veranstaltung: veranstaltung});
  });
});

app.get('/:url/copy', (req, res, next) => {
  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }
    store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
      if (err1) { return next(err1); }
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      veranstaltung.reset();
      res.render('edit', {veranstaltung: veranstaltung, optionen: optionen, Vertrag: Vertrag});
    });
  });
});

app.get('/:url/kopf', (req, res, next) => {
  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }
    store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
      if (err1) { return next(err1); }
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      res.render('edit', {veranstaltung: veranstaltung, optionen: optionen, Vertrag: Vertrag});
    });
  });
});

app.get('/:url/ausgaben', (req, res, next) => {
  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }
    store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
      if (err1) { return next(err1); }
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      res.render('ausgaben', {veranstaltung: veranstaltung, optionen: optionen});
    });
  });
});

app.get('/:url/hotel', (req, res, next) => {
  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }
    store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
      if (err1) { return next(err1); }
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      res.render('hotel', {veranstaltung: veranstaltung, optionen: optionen});
    });
  });
});

app.get('/:url/kasse', (req, res, next) => {
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

app.get('/:url/presse', (req, res, next) => {
  store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
    if (err1) { return next(err1); }
    if (!veranstaltung) {
      return res.redirect('/veranstaltungen/zukuenftige');
    }
    res.render('presse', {veranstaltung: veranstaltung});
  });
});

app.get('/:url/pressePreview', (req, res, next) => {
  store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
    if (err1) { return next(err1); }
    if (!veranstaltung) {
      return res.redirect('/veranstaltungen/zukuenftige');
    }
    res.send(veranstaltung.presseTextHTML(req.query.text));
  });
});

app.get('/:url/stepClicked', (req, res, next) => {
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
  const checked = req.query.checked;
  store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
    veranstaltung.werbung().genehmigungErfolgt(checked === 'true');
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1) { return next(err1); }
      res.send(true);
    });
  });
});

app.get('/:url/reservixChanged', (req, res, next) => {
  store.getVeranstaltung(req.params.url, (err, veranstaltung) => {
    veranstaltung.eintrittspreise().reservixChanged(req.query);
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1) { return next(err1); }
      res.send(true);
    });
  });
});

app.post('/submit', (req, res, next) => {
  const body = req.body;
  store.getVeranstaltungForId(body.id, (err, result) => {
    if (err) { return next(err); }
    const veranstaltung = result || new Veranstaltung();
    veranstaltung.fillFromUI(body);
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1) { return next(err1); }
      optionenService.saveStuffFromVeranstaltung({
        agentur: body.agentur,
        hotel: body.hotel,
        backlineJazzclub: body.kosten && body.kosten.backlineJazzclub,
        backlineRockshop: body.kosten && body.kosten.backlineRockshop,
        techniker: body.staff && body.staff.techniker,
        merchandise: body.staff && body.staff.merchandise,
        kasse: body.staff && body.staff.kasse,
        fremdpersonal: body.staff && body.staff.fremdpersonal
      }, err2 => {
        if (err2) { return next(err2); }
        res.redirect('/veranstaltungen/' + (veranstaltung.istVergangen() ? 'vergangene' : 'zukuenftige'));
      });
    });
  });
});

app.post('/submitWithImage', (req, res, next) => {
  new Form().parse(req, (err, fields, files) => {
    if (err || !files || files.length < 1) { return next(err); }
    const image = files.image[0];
    const imageName = image.originalFilename;
    const imagePath = image.path;
    copyFile(imagePath, path.join(imageDir, imageName), errC => {
      if (errC) { return next(err); }
      store.getVeranstaltungForId(fields.id[0], (err1, veranstaltung) => {
        if (err1) { return next(err1); }
        veranstaltung.presse().fillFromUI({text: fields['presse[text]'], image: imageName});
        store.saveVeranstaltung(veranstaltung, err2 => {
          if (err2) { return next(err2); }
          res.redirect('/veranstaltungen/' + (veranstaltung.istVergangen() ? 'vergangene' : 'zukuenftige'));
        });
        //
        // activityresultsService.addPhotoToActivityResult(activityResultName, files.image[0], req.user.member.id(), (err1, imageUri) => {
        // if (err1) { return next(err1); }
        // res.redirect(app.path() + activityResultName + '/photo/' + imageUri + '/edit');
      });
    });
  });
});

module.exports = app;
