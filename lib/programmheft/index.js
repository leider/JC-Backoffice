const moment = require('moment-timezone');
const R = require('ramda');

const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('kalenderstore');
const Kalender = beans.get('kalender');
const veranstaltungenstore = beans.get('veranstaltungenstore');

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res) => {
  res.redirect(misc.naechsterUngeraderMonat(moment()).format('YYYY/MM'));
});

app.get('/kalenderFor', (req, res, next) => {
  const from = moment(req.query.start);
  from.add(2, 'months'); // wir wollen die 2 Monate vor dem Programmheft, gespeichert ist es aber zum Heftstart
  if (from.month() % 2 === 1) {
    from.subtract(1, 'months'); // auf für den 2. Monat :)
  }
  store.getKalender(from.format('YYYY/MM'), (err, kalender) => {
    if (err) { return next(err); }
    if (!kalender) { return res.end('{}'); }
    res.end(JSON.stringify(kalender.asEvents()));
  });
});

app.get('/:year/:month', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }
  const year = req.params.year;
  const month = req.params.month;
  const start = moment(year + '/' + month, 'YYYY/MM');
  if (month % 2 === 0) {
    return res.redirect('/programmheft/' + misc.naechsterUngeraderMonat(start).format('YYYY/MM'));
  }
  const nextMonth = moment(start);
  const calMonth1 = moment(start);
  const calMonth2 = moment(start);
  nextMonth.add(1, 'months');
  const endMoment = moment(start);
  endMoment.add(2, 'months');
  calMonth1.subtract(2, 'months');
  calMonth2.subtract(1, 'months');

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
        calMonth1,
        calMonth2,
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
