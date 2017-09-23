const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('veranstaltungenstore');

const app = misc.expressAppIn(__dirname);

function addStaff(sectionOfStaff, req, res, next) {
  store.getVeranstaltungForId(req.params.id, (err, veranstaltung) => {
    if (err) { return next(err); }
    veranstaltung.staff()[sectionOfStaff]().push(req.user.id);
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1) { return next(err1); }
      res.redirect('/teamseite');
    });
  });
}

function removeStaff(sectionOfStaff, req, res, next) {
  store.getVeranstaltungForId(req.params.id, (err, veranstaltung) => {
    if (err) { return next(err); }
    const section = veranstaltung.staff()[sectionOfStaff]();
    const index = section.indexOf(req.user.id);
    section.splice(index, 1);
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1) { return next(err1); }
      res.redirect('/teamseite');
    });
  });
}

app.get('/', (req, res, next) => {
  store.zukuenftige((err, veranstaltungen) => {
    if (err) { return next(err); }
    res.render('index', {veranstaltungen: veranstaltungen.filter(v => v.kopf().confirmed())});
  });
});

app.get('/addKasseV/:id', (req, res, next) => {
  addStaff('kasseV', req, res, next);
});

app.get('/addKasse/:id', (req, res, next) => {
  addStaff('kasse', req, res, next);
});

app.get('/addTechnikerV/:id', (req, res, next) => {
  addStaff('technikerV', req, res, next);
});

app.get('/addTechniker/:id', (req, res, next) => {
  addStaff('techniker', req, res, next);
});

app.get('/removeKasseV/:id', (req, res, next) => {
  removeStaff('kasseV', req, res, next);
});

app.get('/removeKasse/:id', (req, res, next) => {
  removeStaff('kasse', req, res, next);
});

app.get('/removeTechnikerV/:id', (req, res, next) => {
  removeStaff('technikerV', req, res, next);
});

app.get('/removeTechniker/:id', (req, res, next) => {
  removeStaff('techniker', req, res, next);
});

module.exports = app;