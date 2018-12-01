const R = require('ramda');
const async = require('async');
const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('veranstaltungenstore');
const userstore = beans.get('userstore');
const optionenservice = beans.get('optionenService');

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
  async.parallel(
    {
      veranstaltungen: callback => store.zukuenftigeMitGestern(callback),
      users: callback => userstore.allUsers(callback),
      icals: callback => optionenservice.icals(callback)
    },
    (err, results) => {
      if (err) { return next(err); }
      const icals = results.icals.forCalendar();
      icals.unshift('/veranstaltungen/eventsForCalendar');
      icals.unshift('/ical/eventsForCalendar');
      res.render('index', {
        veranstaltungen: results.veranstaltungen.filter(v => v.kopf().confirmed()),
        users: R.sortBy(R.prop('name'), results.users),
        icals: icals,
        webcalURL: conf.get('publicUrlPrefix').replace(/https|http/, 'webcal') + '/ical/'
      });
    }
  );
});

app.get('/addKasseV/:id', (req, res, next) => {
  addStaff('kasseV', req, res, next);
});

app.get('/addKasse/:id', (req, res, next) => {
  addStaff('kasse', req, res, next);
});

app.get('/addMoD/:id', (req, res, next) => {
  addStaff('mod', req, res, next);
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

app.get('/removeMoD/:id', (req, res, next) => {
  removeStaff('mod', req, res, next);
});

app.get('/removeTechnikerV/:id', (req, res, next) => {
  removeStaff('technikerV', req, res, next);
});

app.get('/removeTechniker/:id', (req, res, next) => {
  removeStaff('techniker', req, res, next);
});

module.exports = app;
