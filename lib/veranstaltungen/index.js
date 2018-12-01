const conf = require('simple-configure');
const R = require('ramda');
const async = require('async');
const moment = require('moment-timezone');

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
    if (veranstaltung.reservixID() && (!veranstaltung.salesreport() || !veranstaltung.salesreport().istVergangen())) {
      reservixService.salesreportFor(veranstaltung.reservixID(), salesreport => {
        veranstaltung.associateSalesreport(salesreport);
        store.saveVeranstaltung(veranstaltung, err => {
          return callback(err, veranstaltung);
        });
      });
    } else {
      callback(null, veranstaltung);
    }
  }

  return fetcher((err, veranstaltungen) => {
    if (err) { return next(err); }
    async.parallel(
      {
        users: callback => userstore.allUsers(callback),
        icals: callback => optionenservice.icals(callback)
      },
      (err1, results) => {
        if (err1) { return next(err1); }
        async.each(veranstaltungen, associateReservix, err2 => {
          if (err2) { return next(err2); }
          const icals = results.icals.forCalendar();
          icals.unshift('/veranstaltungen/eventsForCalendar');
          icals.unshift('/ical/eventsForCalendar');

          res.render('../../teamseite/views/indexAdmin', {
            titel: titel,
            users: R.sortBy(R.prop('name'), results.users),
            icals: icals,
            veranstaltungen: filterUnbestaetigteFuerJedermann(veranstaltungen, res),
            webcalURL: conf.get('publicUrlPrefix').replace(/https|http/, 'webcal') + '/ical/'
          });
        });
      });
  });
}

function isValidUrl(reservedURLs, url, callback) {
  const isReserved = new RegExp(reservedURLs, 'i').test(url);
  if (fieldHelpers.containsSlash(url) || isReserved) { return callback(null, false); }
  store.getVeranstaltung(url, (err, result) => {
    if (err) { return callback(err); }
    callback(null, result === null);
  });
}

function eventsBetween(startMoment, endMoment, res, callback) {
  function asCalendarEvent(veranstaltung) {
    return {
      start: veranstaltung.startMoment().format(),
      end: veranstaltung.endMoment().format(),
      url: veranstaltung.fullyQualifiedUrl() + '/preview',
      title: veranstaltung.kopf().titel(),
      tooltip: veranstaltung.tooltipInfos(),
      className: (!veranstaltung.kopf().confirmed() ? 'color-geplant ' : '') +
        'verySmall color-' + veranstaltung.kopf().cssColorCode()
    };
  }

  store.byDateRangeInAscendingOrder(startMoment, endMoment, (err, veranstaltungen) => {
    if (err) { return callback(err); }
    callback(null, filterUnbestaetigteFuerJedermann(veranstaltungen, res).map(asCalendarEvent));
  });
}

app.get('/', (req, res) => res.redirect('/veranstaltungen/zukuenftige'));

app.get('/zukuenftige', (req, res, next) => veranstaltungenForDisplay(store.zukuenftigeMitGestern, next, res, 'Zukünftige'));

app.get('/vergangene', (req, res, next) => veranstaltungenForDisplay(store.vergangene, next, res, 'Vergangene'));

app.get('/checkurl', (req, res) => misc.validate(req.query.url, req.query.previousUrl, R.partial(isValidUrl, ['^new|^zukuenftige|^vergangene']), res.end));

app.get('/new', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  optionenService.optionenUndOrte((err, optionen, orte) => {
    if (err) { return next(err); }
    res.render('edit/kopf', {veranstaltung: new Veranstaltung(), optionen, orte, Vertrag});
  });
});

app.get('/monat/:monat', (req, res, next) => {
  const monat = req.params.monat; // kommt als YYMM
  const start = moment(monat + '01', 'YYMMDD');
  const end = start.clone();
  end.add(1, 'M');
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) { return next(err); }
    res.render('monatsliste', {liste: result, monat});
  });
});

app.get('/imgzip/:monat', (req, res, next) => {
  const monat = req.params.monat; // kommt als YYMM
  const start = moment(monat + '01', 'YYMMDD');
  const end = start.clone();
  end.add(1, 'M');
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) { return next(err); }
    const images = R.flatten(result.map(veranst => veranst.presse().image()))
                    .map(filename => { return {path: uploadDir + '/' + filename, name: filename};});
    res.zip(images, 'Jazzclub Bilder ' + start.format('MMM \'YY') + '.zip');
  });
});

app.get('/texte/:monat', (req, res, next) => {
  const monat = req.params.monat; // kommt als YYMM
  const start = moment(monat + '01', 'YYMMDD');
  const end = start.clone();
  end.add(1, 'M');
  store.byDateRangeInAscendingOrder(start, end, (err, result) => {
    if (err) { return next(err); }
    res.render('pressetexte', {liste: result, monat});
  });
});

app.get('/eventsForCalendar', (req, res, next) => {
  const start = moment(req.query.start).utc();
  const end = moment(req.query.end).utc();
  eventsBetween(start, end, res, (err1, events) => {
    if (err1) { return next(err1); }
    res.end(JSON.stringify(events));
  });
});

app.post('/updateStaff', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  const body = req.body;
  store.getVeranstaltungForId(body.id, (err, veranstaltung) => {
    if (err || !veranstaltung) { return next(err); }
    veranstaltung.staff().updateStaff(body.staff || {});
    store.saveVeranstaltung(veranstaltung, err1 => {
      if (err1 || !veranstaltung) { return next(err1); }
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
