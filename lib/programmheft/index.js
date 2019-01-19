const moment = require('moment-timezone');
const R = require('ramda');

const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('veranstaltungenstore');

const app = misc.expressAppIn(__dirname);

function createJahrMonatArray(startMoment) {
  startMoment.add(1 + (startMoment.month() % 2 ? 0 : 1), 'months'); // Auf den nächsten ungeraden Monat schieben
  startMoment.date(1); // auf den Monatsersten setzen
  const dates = [startMoment.format('YYYY/MM')];
  for (let i = 0; i < 6; i++) {
    startMoment.add(2, 'months');
    dates.push(startMoment.format('YYYY/MM'));
  }
  return dates;
}

app.get('/', (req, res) => {
  const dates = createJahrMonatArray(moment());
  res.render('index', {dates});
});

app.get('/:jahr/:monat', (req, res, next) => {
  const monat = req.params.monat; // kommt als MM
  const jahr = req.params.jahr; // kommt als YY
  const startMoment = moment(jahr + monat + '01', 'YYYYMMDD');
  startMoment.subtract(1, 'days');
  const endMoment = moment(jahr + monat + '01', 'YYYYMMDD');
  endMoment.add(2, 'months');
  store.byDateRangeInAscendingOrder(startMoment, endMoment, (err, veranstaltungen) => {
    if (err) { return next(err); }
    const filteredVeranstaltungen = veranstaltungen.filter(v => v.kopf().confirmed());
    const unconfirmedVeranstaltungen = veranstaltungen.filter(v => !v.kopf().confirmed());
    const groupedVeranstaltungen = R.groupBy(veranst => veranst.startMoment().format('MMMM \'YY'), filteredVeranstaltungen);
    res.render('heft', {
      unconfirmedVeranstaltungen,
      groupedVeranstaltungen,
      date: monat + ' ' + jahr
    });
  });
});

module.exports = app;
