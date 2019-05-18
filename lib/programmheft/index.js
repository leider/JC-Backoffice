const R = require('ramda');

const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('kalenderstore');
const veranstaltungenstore = beans.get('veranstaltungenstore');
const DatumUhrzeit = beans.get('DatumUhrzeit');

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res) => {
  res.redirect(new DatumUhrzeit().naechsterUngeraderMonat().fuerKalenderViews());
});

app.get('/kalenderFor', (req, res, next) => {
  const from = DatumUhrzeit.forISOString(req.query.start);
  const addend = from.istGeraderMonat() ? 1 : 2; // wir wollen die 2 Monate vor dem Programmheft, gespeichert ist es aber zum Heftstart
  store.getKalender(from.plus({monate: addend}).fuerKalenderViews(), (err, kalender) => {
    if (err) {
      return next(err);
    }
    if (!kalender) {
      return res.end('{}');
    }
    res.end(JSON.stringify(kalender.asEvents()));
  });
});

app.get('/:year/:month', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }
  const year = req.params.year;
  const month = req.params.month;
  const start = DatumUhrzeit.forYYYYMM(year + '' + month);
  if (month % 2 === 0) {
    return res.redirect(
      '/programmheft/' +
        DatumUhrzeit.forYYYYMM(year + '' + month)
          .naechsterUngeraderMonat()
          .fuerKalenderViews()
    );
  }
  const end = start.plus({monate: 2});

  store.getKalender(year + '/' + month, (err, kalender) => {
    if (err) {
      return next(err);
    }
    veranstaltungenstore.byDateRangeInAscendingOrder(
      start,
      end,
      (err1, veranstaltungen) => {
        if (err1) {
          return next(err1);
        }
        const filteredVeranstaltungen = veranstaltungen.filter(v =>
          v.kopf().confirmed()
        );
        const unconfirmedVeranstaltungen = veranstaltungen.filter(
          v => !v.kopf().confirmed()
        );
        const groupedVeranstaltungen = R.groupBy(
          veranst => veranst.startDatumUhrzeit().monatLangJahrKompakt(),
          filteredVeranstaltungen
        );
        res.render('heft', {
          unconfirmedVeranstaltungen,
          groupedVeranstaltungen,
          start,
          kalender
        });
      }
    );
  });
});

app.post('/submit', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  const body = req.body;
  store.getKalender(body.id, (err, kalender) => {
    if (err) {
      return next(err);
    }
    kalender.setText(body.text);
    store.saveKalender(kalender, err1 => {
      if (err1) {
        return next(err1);
      }
      res.redirect(body.id);
    });
  });
});

module.exports = app;
