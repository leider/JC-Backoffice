import { salesreportFor } from '../reservix/reservixService';

import conf from '../commons/simpleConfigure';
import fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const zipstream = require('zip-stream');
import express from 'express';
import async from 'async';
import R from 'ramda';

import path from 'path';
import fieldHelpers from '../commons/fieldHelpers';
import misc from '../commons/misc';

import optionenService from '../optionen/optionenService';
import store from './veranstaltungenstore';
import Veranstaltung from './object/veranstaltung';
import Vertrag from './object/vertrag';
import userstore from '../users/userstore';
import DatumUhrzeit from '../commons/DatumUhrzeit';
import OptionValues from '../optionen/optionValues';
import Orte from '../optionen/orte';
import User from '../users/user';
import Salesreport from '../reservix/salesreport';

const app = misc.expressAppIn(__dirname);

const uploadDir = path.join(__dirname, '../../public/upload');

// const fileexportStadtKarlsruhe = beans.get('fileexportStadtKarlsruhe');

function filterUnbestaetigteFuerJedermann(
  veranstaltungen: Veranstaltung[],
  res: express.Response
) {
  if (res.locals.accessrights.isBookingTeam()) {
    return veranstaltungen;
  }
  return veranstaltungen.filter(v => v.kopf().confirmed());
}

function veranstaltungenForDisplay(fetcher: Function, next: express.NextFunction, res: express.Response, titel: string) {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/teamseite/');
  }

  function associateReservix(veranstaltung: Veranstaltung, callback: Function) {
    if (
      veranstaltung.reservixID() &&
      (!veranstaltung.salesreport() ||
        !veranstaltung.salesreport()?.istVergangen())
    ) {
      salesreportFor(veranstaltung.reservixID(), (salesreport?: Salesreport) => {
        veranstaltung.associateSalesreport(salesreport);
        store.saveVeranstaltung(veranstaltung, (err: Error | null) => {
          return callback(err, veranstaltung);
        });
      });
    } else {
      callback(null, veranstaltung);
    }
  }

  return fetcher((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return next(err);
    }
    async.parallel(
      {
        users: callback => userstore.allUsers(callback),
        icals: callback => optionenService.icals(callback)
      },
      (err1, results: any) => {
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
            veranst => veranst.startDatumUhrzeit().monatLangJahrKompakt,
            filteredVeranstaltungen
          );
          res.render('../../teamseite/views/indexAdmin', {
            titel,
            users: R.sortBy(R.prop('name'), results.users as User[]),
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

function veranstaltungenForExport(
  fetcher: Function,
  next: express.NextFunction,
  res: express.Response
) {
  if (!res.locals.accessrights.isBookingTeam()) {
    return res.redirect('/');
  }

  return fetcher((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return next(err);
    }
    const lines = veranstaltungen.map(veranstaltung => veranstaltung.toCSV());
    res.set('Content-Type', 'text/csv').send(lines);
  });
}

function eventsBetween(
  start: DatumUhrzeit,
  end: DatumUhrzeit,
  res: express.Response,
  callback: Function
) {
  function asCalendarEvent(veranstaltung: Veranstaltung) {
    const urlSuffix = res.locals.accessrights.isOrgaTeam()
      ? '/allgemeines'
      : '/preview';

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

  store.byDateRangeInAscendingOrder(
    start,
    end,
    (err: Error | null, veranstaltungen: Veranstaltung[]) => {
      if (err) {
        return callback(err);
      }
      callback(
        null,
        filterUnbestaetigteFuerJedermann(veranstaltungen, res).map(
          asCalendarEvent
        )
      );
    }
  );
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

  optionenService.optionenUndOrte(
    (err: Error | null, optionen: OptionValues, orte: Orte) => {
      if (err) {
        return next(err);
      }
      res.render('edit/allgemeines', {
        veranstaltung: new Veranstaltung({}),
        optionen,
        orte,
        Vertrag
      });
    }
  );
});

app.get('/monat/:monat', (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(
    start,
    end,
    (err: Error | null, result: Veranstaltung[]) => {
      if (err) {
        return next(err);
      }
      res.render('monatsliste', { liste: result, monat: yymm });
    }
  );
});

app.get('/imgzip/:monat', (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(
    start,
    end,
    (err: Error | null, result: Veranstaltung[]) => {
      if (err) {
        return next(err);
      }
      const images = R.flatten(
        result.map(veranst => veranst.presse().image())
      ).map(filename => {
        return { path: uploadDir + '/' + filename, name: filename };
      });
      const filename = 'Jazzclub Bilder ' + start.monatJahrKompakt + '.zip';

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
    }
  );
});

app.get('/texte/:monat', (req, res, next) => {
  const yymm = req.params.monat; // kommt als YYMM
  const start = DatumUhrzeit.forYYMM(yymm);
  const end = start.plus({ monate: 1 });
  store.byDateRangeInAscendingOrder(
    start,
    end,
    (err: Error | null, result: Veranstaltung[]) => {
      if (err) {
        return next(err);
      }
      res.render('pressetexte', { liste: result, monat: yymm });
    }
  );
});

app.get('/eventsForCalendar', (req, res, next) => {
  const start = DatumUhrzeit.forISOString(req.query.start);
  const end = DatumUhrzeit.forISOString(req.query.end);
  eventsBetween(start, end, res, (err1: Error | null, events: any[]) => {
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
  store.getVeranstaltungForId(
    body.id,
    (err: Error | null, veranstaltung: Veranstaltung) => {
      if (err || !veranstaltung) {
        return next(err);
      }
      veranstaltung.staff().updateStaff(body.staff || {});
      store.saveVeranstaltung(veranstaltung, (err1: Error | null) => {
        if (err1 || !veranstaltung) {
          return next(err1);
        }
        res.redirect('/');
      });
    }
  );
});

import { addRoutesTo } from './indexDetails';

addRoutesTo(app);

// app.get('/:url/fileexportStadtKarlsruhe', (req, res, next) => {
//   fileexportStadtKarlsruhe.send(req.params.url, (err, result) => {
//     if (err) { return next(err); }
//     res.send(result);
//   });
// });

export default app;
