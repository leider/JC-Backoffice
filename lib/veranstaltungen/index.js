const conf = require('simple-configure');
const R = require('ramda');
const async = require('async');
const fs = require('fs');
const zipstream = require('zip-stream');

const path = require('path');

const beans = conf.get('beans');
const misc = beans.get('misc');
const fieldHelpers = beans.get('fieldHelpers');

const optionenService = beans.get('optionenService');
const store = beans.get('veranstaltungenstore');
const Veranstaltung = beans.get('veranstaltung');
const Vertrag = beans.get('vertrag');
const reservixService = beans.get('reservixService');
const userstore = beans.get('userstore');
const optionenservice = beans.get('optionenService');
const DatumUhrzeit = beans.get('DatumUhrzeit');

const app = misc.expressAppIn(__dirname);

const uploadDir = path.join(__dirname, '../../public/upload');

// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

function filterUnbestaetigteFuerJedermann(veranstaltungen, res) {
  if (res.locals.accessrights.isBookingTeam()) {
    return veranstaltungen;
  }
  return veranstaltungen.filter(v => v.kopf().confirmed());
}

function veranstaltungenForDisplay(fetcher, next, res, titel) {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/teamseite/');
  }

  function associateReservix(veranstaltung, callback) {
    if (
      veranstaltung.reservixID() &&
      (!veranstaltung.salesreport() ||
        !veranstaltung.salesreport().istVergangen())
    ) {
      reservixService.salesreportFor(
        veranstaltung.reservixID(),
        salesreport => {
          veranstaltung.associateSalesreport(salesreport);
          store.saveVeranstaltung(veranstaltung, err => {
            return callback(err, veranstaltung);
          });
        }
      );
    } else {
      callback(null, veranstaltung);
    }
  }

  return fetcher((err, veranstaltungen) => {
    if (err) {
      return next(err);
    }
    async.parallel(
      {
        users: callback => userstore.allUsers(callback),
        icals: callback => optionenservice.icals(callback)
      },
      (err1, results) => {
        if (err1) {
          return next(err1);
        }
        async.each(veranstaltungen, associateReservix, err2 => {
          if (err2) {
            return next(err2);
          }
          const icals = results.icals.forCalendar();
          icals.unshift('/veranstaltungen/eventsForCalendar');
          icals.unshift('/ical/eventsForCalendar');

          const filteredVeranstaltungen = filterUnbestaetigteFuerJedermann(
            veranstaltungen,
            res
          );
          const groupedVeranstaltungen = R.groupBy(
            veranst => veranst.startDatumUhrzeit().monatLangJahrKompakt(),
            filteredVeranstaltungen
          );
          res.render('../../teamseite/views/indexAdmin', {
            titel,
            users: R.sortBy(R.prop('name'), results.users),
            icals,
            groupedVeranstaltungen,
            webcalURL:
              conf.get('publicUrlPrefix').replace(/https|http/, 'webcal') +
              '/ical/'
          });
        });
      }
    );
  });
}

function veranstaltungenForExport(fetcher, next, res) {
  if (!res.locals.accessrights.isBookingTeam()) {
    return res.redirect('/');
  }

  return fetcher((err, veranstaltungen) => {
    if (err) {
      return next(err);
    }
    const lines = veranstaltungen.map(veranstaltung => veranstaltung.toCSV());
    res.set('Content-Type', 'text/csv').send(lines);
  });
}

function eventsBetween(start, end, res, callback) {
  function asCalendarEvent(veranstaltung) {
    const urlSuffix = res.locals.accessrights.isOrgaTeam() ? '/allgemeines' : '/preview';

    return {
      start: veranstaltung.startDate().toISOString(),
      end: veranstaltung.endDate().toISOString(),
      url: veranstaltung.fullyQualifiedUrl() + urlSuffix,
      title: veranstaltung.kopf().titel(),
      tooltip: veranstaltung.tooltipInfos(),
      className:
        (!veranstaltung.kopf().confirmed() ? 'color-geplant ' : '') +
        'verySmall color-' +
        fieldHelpers.cssColorCode(veranstaltung.kopf().eventTyp())
    };
  }

  store.byDateRangeInAscendingOrder(start, end, (err, veranstaltungen) => {
    if (err) {
      return callback(err);
    }
    callback(
      null,
      filterUnbestaetigteFuerJedermann(veranstaltungen, res).map(
        asCalendarEvent
      )
    );
  });
}

app.get('/', (req, res) => res.redirect('/veranstaltungen/zukuenftige'));

app.get('/zukuenftige', (req, res, next) =>
  veranstaltungenForDisplay(
    store.zukuenftigeMitGestern,
    next,
    res,
    'Zukünftige'
  )
);

app.get('/vergangene', (req, res, next) =>
  veranstaltungenForDisplay(store.vergangene, next, res, 'Vergangene')
);

app.get('/zukuenftige/csv', (req, res, next) =>
  veranstaltungenForExport(store.zukuenftigeMitGestern, next, res)
);

app.get('/vergangene/csv', (req, res, next) =>
  veranstaltungenForExport(store.vergangene, next, res)
);

app.get('/new', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  optionenService.optionenUndOrte((err, optionen, orte) => {
    if (err) {
      return next(err);
    }
    res.render('edit/allgemeines', {
      veranstaltung: new Veranstaltung(),
      optionen,
      orte,
      Vertrag
    });
  });
});

app.get('/monat/:monat', (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('monatsliste', { liste: result, monat: yymm });
  });
});

app.get('/imgzip/:monat', (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) {
      return next(err);
    }
    const images = R.flatten(
      result.map(veranst => veranst.presse().image())
    ).map(filename => {
      return { path: uploadDir + '/' + filename, name: filename };
    });
    const filename = 'Jazzclub Bilder ' + start.monatJahrKompakt() + '.zip';

    res.header('Content-Type', 'application/zip');
    res.header(
      'Content-Disposition',
      'attachment; filename="' + filename + '"'
    );

    const zip = zipstream({ level: 1 });
    zip.pipe(res); // res is a writable stream

    async.forEachSeries(
      images,
      (file, cb) => {
        zip.entry(fs.createReadStream(file.path), { name: file.name }, cb);
      },
      err1 => {
        if (err1) {
          return next(err1);
        }
        zip.finalize();
      }
    );
  });
});

app.get('/texte/:monat', (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) {
      return next(err);
    }
    res.render('pressetexte', { liste: result, monat: yymm });
  });
});

app.get('/eventsForCalendar', (req, res, next) => {
  const start = DatumUhrzeit.forISOString(req.query.start);
  const end = DatumUhrzeit.forISOString(req.query.end);
  eventsBetween(start, end, res, (err1, events) => {
    if (err1) {
      return next(err1);
    }
    res.end(JSON.stringify(events));
  });
});

app.post('/updateStaff', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  const body = req.body;
  store.getVeranstaltungForId(body.id, (err, veranstaltung) => {
    if (err || !veranstaltung) {
      return next(err);
    }
    veranstaltung.staff().updateStaff(body.staff || {});
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1 || !veranstaltung) {
        return next(err1);
      }
      res.redirect('/');
    });
  });
});

require('./indexDetails').addRoutesTo(app);

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

module.exports = app;
