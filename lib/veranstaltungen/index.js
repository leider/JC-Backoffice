const moment = require('moment-timezone');
const conf = require('simple-configure');
const beans = conf.get('beans');
const misc = beans.get('misc');

const service = beans.get('veranstaltungenService');
const store = beans.get('veranstaltungenstore');
const Veranstaltung = beans.get('veranstaltung');

const app = misc.expressAppIn(__dirname);

app.get('/:jahr', (req, res, next) => {
  const jahr = req.params.jahr;
  service.fuerJahr(jahr, (err, veranstaltungen) => {
    if (err) { return next(err); }
    res.render('liste', {jahr: jahr, veranstaltungen: veranstaltungen});
  });
});

app.get('/:jahr/new', (req, res, next) => {
  service.optionen((err, optionen) => {
    if (err) { return next(err); }
    res.render('edit', {veranstaltung: new Veranstaltung(), optionen: optionen});
  });
});

app.get('/:jahr/:url', (req, res, next) => {
  service.optionen((err, optionen) => {
    if (err) { return next(err); }
    store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
      if (err1) { return next(err1); }
      res.render('edit', {veranstaltung: veranstaltung, optionen: optionen});
    });
  });
});

app.post('/submit', (req, res, next) => {
  const veranstaltung = new Veranstaltung();
  veranstaltung.fillFromUI(req.body);
  store.saveVeranstaltung(veranstaltung, err => {
    if (err) { return next(err); }
    res.redirect('/veranstaltungen/' + moment().year());
  });
});

module.exports = app;
