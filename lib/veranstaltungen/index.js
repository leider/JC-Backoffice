const conf = require('simple-configure');
const R = require('ramda');

const beans = conf.get('beans');
const misc = beans.get('misc');
const fieldHelpers = beans.get('fieldHelpers');

// const service = beans.get('veranstaltungenService');
const optionenService = beans.get('optionenService');
const store = beans.get('veranstaltungenstore');
const Veranstaltung = beans.get('veranstaltung');

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
    res.render('edit', {veranstaltung: new Veranstaltung(), optionen: optionen});
  });
});

app.get('/:url', (req, res) => res.redirect('/veranstaltungen/' + req.params.url + '/kopf'));

app.get('/:url/kopf', (req, res, next) => {
  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }
    store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
      if (err1) { return next(err1); }
      if (!veranstaltung) {
        return res.redirect('/veranstaltungen/zukuenftige');
      }
      res.render('edit', {veranstaltung: veranstaltung, optionen: optionen});
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
      res.render('edit', {veranstaltung: veranstaltung, optionen: optionen});
    });
  });
});

app.post('/submit', (req, res, next) => {
  const veranstaltung = new Veranstaltung();
  const body = req.body;
  veranstaltung.fillFromUI(body);
  store.saveVeranstaltung(veranstaltung, err => {
    if (err) { return next(err); }
    optionenService.saveAgentur(body.agentur, err1 => {
      if (err1) { return next(err1); }
      res.redirect('/veranstaltungen/' + (veranstaltung.istVergangen() ? 'vergangene' : 'zukuenftige'));
    });
  });
});

module.exports = app;
