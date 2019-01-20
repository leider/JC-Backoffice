const moment = require('moment-timezone');
const R = require('ramda');

const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('kalenderstore');
const Kalender = beans.get('kalender');
const veranstaltungenstore = beans.get('veranstaltungenstore');

const app = misc.expressAppIn(__dirname);

const eventsToObject = require('./eventsToObject');

app.get('/', (req, res) => {
  const now = moment();
  now.add(1 + (now.month() % 2 ? 0 : 1), 'months'); // Auf den nächsten ungeraden Monat schieben
  res.redirect(now.format('YYYY/MM'));
});

app.get('/kalenderFor', (req, res, next) => {
  const from = moment(req.query.start);
  if (from.month() % 2 === 1) {
    from.subtract(1, 'months');
  }
  store.getKalender(from.format('YYYY/MM'), (err, kalender) => {
    if (err) { return next(err); }
    if (!kalender) { return res.end('{}'); }
    res.end(JSON.stringify(eventsToObject(kalender.text(), from.format('YYYY'))));
  });
});

app.get('/:year/:month', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }
  const year = req.params.year;
  const month = req.params.month;
  const start = moment(year + '/' + month, 'YYYY/MM');
  const nextMonth = moment(start);
  nextMonth.add(1, 'months');
  const endMoment = moment(start);
  endMoment.add(2, 'months');
  store.getKalender(year + '/' + month, (err, kalender) => {
    if (err) { return next(err); }
    veranstaltungenstore.byDateRangeInAscendingOrder(start, endMoment, (err1, veranstaltungen) => {
      if (err1) { return next(err1); }
      const filteredVeranstaltungen = veranstaltungen.filter(v => v.kopf().confirmed());
      const unconfirmedVeranstaltungen = veranstaltungen.filter(v => !v.kopf().confirmed());
      const groupedVeranstaltungen = R.groupBy(veranst => veranst.startMoment().format('MMMM \'YY'), filteredVeranstaltungen);
      res.render('heft', {
        unconfirmedVeranstaltungen,
        groupedVeranstaltungen,
        start,
        nextMonth,
        kalender: kalender || new Kalender({id: year + '/' + month})
      });
    });
  });
});

app.post('/submit', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  const body = req.body;
  store.getKalender(body.id, (err, kalender) => {
    if (err) { return next(err); }
    const cal = kalender || new Kalender({id: body.id});
    cal.setText(body.text);
    store.saveKalender(cal, err1 => {
      if (err1) { return next(err1); }
      res.redirect(body.id);
    });
  });
});

module.exports = app;
