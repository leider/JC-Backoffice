const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('veranstaltungenstore');
const terminstore = beans.get('terminstore');
const Termin = beans.get('termin');
const icalService = beans.get('icalService');

const app = misc.expressAppIn(__dirname);

function sendCalendarStringNamedToResult(ical, filename, res) {
  res.type('text/calendar; charset=utf-8');
  res.header('Content-Disposition', 'inline; filename=' + filename + '.ics');
  res.send(ical.toString());
}

app.get('/', (req, res, next) => {
  store.alle((err, veranstaltungen) => {
    if (err || !veranstaltungen) { return next(err); }
    sendCalendarStringNamedToResult(
      icalService.icalForVeranstaltungen(veranstaltungen.filter(v => v.kopf().confirmed())),
      'events',
      res
    );
  });
});

app.get('/termine', (req, res, next) => {
  terminstore.alle((err, termine) => {
    if (err) { return next(err); }
    termine.push(new Termin());
    res.render('termine', {termine});
  });

});

app.post('/submit', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }

  const body = req.body;
  if (body.id) {
    terminstore.forId(body.id, (err, termin) => {
      if (err || !termin) { return next(err); }
      termin.fillFromUI(body);
      terminstore.save(termin, err1 => {
        if (err1) { return next(err1); }
        res.redirect('/ical/termine');
      });
    });
  } else {
    const termin = new Termin();
    termin.fillFromUI(body);
    terminstore.save(termin, err1 => {
      if (err1) { return next(err1); }
      res.redirect('/ical/termine');
    });

  }
});

module.exports = app;
