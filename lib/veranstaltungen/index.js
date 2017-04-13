const conf = require('simple-configure');
const R = require('ramda');

const beans = conf.get('beans');
const misc = beans.get('misc');
const fieldHelpers = beans.get('fieldHelpers');

// const service = beans.get('veranstaltungenService');
const optionenService = beans.get('optionenService');
const store = beans.get('veranstaltungenstore');
const Veranstaltung = beans.get('veranstaltung');
const Vertrag = beans.get('vertrag');

const app = misc.expressAppIn(__dirname);

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

module.exports = app;
