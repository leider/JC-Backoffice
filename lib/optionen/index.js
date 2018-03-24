const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const service = beans.get('optionenService');
const store = beans.get('optionenstore');

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res, next) => {
  if (!res.locals.accessrights.hasSomeGroupAssigned()) {
    return res.redirect('/');
  }

  service.optionen((err, optionen) => {
    if (err) { return next(err); }
    res.render('optionen', {optionen: optionen});
  });
});

app.get('/emailAddresses', (req, res, next) => {
  if (!res.locals.accessrights.hasSomeGroupAssigned()) {
    return res.redirect('/');
  }

  service.emailAddresses((err, emailAddresses) => {
    if (err) { return next(err); }
    res.render('emailAddresses', {emailAddresses: emailAddresses});
  });
});

app.get('/agenturForAuswahl', (req, res) => {
  service.agenturForAuswahl(req.query.auswahl, (err, kontakt) => res.send(kontakt));
});

app.get('/hotelForAuswahl', (req, res) => {
  service.hotelForAuswahl(req.query.auswahl, (err, kontakt) => res.send(kontakt));
});

app.get('/preiseForAuswahl', (req, res) => {
  service.preiseForAuswahl(req.query.auswahl, (err, preise) => res.send(preise));
});

app.get('/flaecheForOrt', (req, res) => {
  service.flaecheForOrt(req.query.ort, (err, flaeche) => res.send(flaeche));
});

app.post('/submit', (req, res, next) => {
  if (!res.locals.accessrights.hasSomeGroupAssigned()) {
    return res.redirect('/');
  }
  service.optionen((err, optionen) => {
    if (err) { return next(err); }
    optionen.fillFromUI(req.body);
    store.save(optionen, err1 => {
      if (err1) { return next(err1); }
      res.redirect('/');
    });
  });
});

module.exports = app;
