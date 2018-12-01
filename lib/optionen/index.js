const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const service = beans.get('optionenService');
const store = beans.get('optionenstore');

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  service.optionen((err, optionen) => {
    if (err) { return next(err); }
    res.render('optionen', {optionen: optionen});
  });
});

app.get('/orte', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  service.orte((err, orte) => {
    if (err) { return next(err); }
    res.render('orte', {orte});
  });
});

app.get('/icals', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  service.icals((err, icals) => {
    if (err) { return next(err); }
    res.render('icals', {icals: icals || {}});
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

app.post('/ortChanged', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }
  const ort = req.body;
  // eslint-disable-next-line no-underscore-dangle
  delete ort._csrf;
  service.orte((err, orte) => {
    if (err) { return next(err); }
    if (ort.name) {
      if (ort.oldname) { //ändern
        orte.updateOrt(ort.oldname, ort);
      } else { //neu
        orte.addOrt(ort);
      }
    } else { //löschen
      orte.deleteOrt(ort.oldname);
    }
    store.save(orte, err1 => {
      if (err1) { return next(err1); }
      res.redirect('orte');
    });
  });

});

app.post('/icalChanged', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }
  const ical = req.body;
  // eslint-disable-next-line no-underscore-dangle
  delete ical._csrf;
  service.icals((err, icals) => {
    if (err) { return next(err); }
    if (ical.name) {
      if (ical.oldname) { //ändern
        icals.updateIcal(ical.oldname, ical);
      } else { //neu
        icals.addIcal(ical);
      }
    } else { //löschen
      icals.deleteIcal(ical.oldname);
    }
    store.save(icals, err1 => {
      if (err1) { return next(err1); }
      res.redirect('icals');
    });
  });

});

app.post('/submit', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
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
