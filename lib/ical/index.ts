import misc from '../commons/misc';
import DatumUhrzeit from '../commons/DatumUhrzeit';
import terminstore from './terminstore';
import icalService from './icalService';
import express from 'express';
import Termin, { TerminEvent } from './termin';

import store from '../veranstaltungen/veranstaltungenstore';
import Veranstaltung from '../veranstaltungen/object/veranstaltung';

const app = misc.expressAppIn(__dirname);

function sendCalendarStringNamedToResult(
  ical: any,
  filename: string,
  res: express.Response
) {
  res.type('text/calendar; charset=utf-8');
  res.header('Content-Disposition', 'inline; filename=' + filename + '.ics');
  res.send(ical.toString());
}

app.get('/', (req, res, next) => {
  store.alle((err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err || !veranstaltungen) {
      return next(err);
    }
    sendCalendarStringNamedToResult(
      icalService.icalForVeranstaltungen(
        veranstaltungen.filter(v => v.kopf().confirmed())
      ),
      'events',
      res
    );
  });
});

app.get('/termine', (req, res, next) => {
  terminstore.alle((err: Error | null, termine: Termin[]) => {
    if (err) {
      return next(err);
    }
    termine.unshift(new Termin());
    res.render('termine', { termine });
  });
});

app.get('/eventsForCalendar', (req, res, next) => {
  const start = DatumUhrzeit.forISOString(req.query.start);
  const end = DatumUhrzeit.forISOString(req.query.end);
  icalService.termineAsEventsBetween(
    start,
    end,
    (err: Error | null, events: TerminEvent[]) => {
      if (err) {
        return next(err);
      }
      res.end(JSON.stringify(events));
    }
  );
});

app.get('/eventsFromIcalURL/:url', (req, res, next) => {
  const url = req.params.url;
  icalService.termineFromIcalURL(
    url,
    (err: Error | null, events: TerminEvent) => {
      if (err) {
        return next(err);
      }
      res.end(JSON.stringify(events));
    }
  );
});

app.get('/delete/:id', (req, res, next) => {
  terminstore.remove(req.params.id, (err: Error | null) => {
    if (err) {
      return next(err);
    }
    res.redirect('/ical/termine');
  });
});

app.post('/submit', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }

  const body = req.body;
  if (body.id) {
    terminstore.forId(body.id, (err: Error | null, termin: Termin) => {
      if (err || !termin) {
        return next(err);
      }
      termin.fillFromUI(body);
      terminstore.save(termin, (err1: Error | null) => {
        if (err1) {
          return next(err1);
        }
        res.redirect('/ical/termine');
      });
    });
  } else {
    const termin = new Termin();
    termin.fillFromUI(body);
    terminstore.save(termin, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
      res.redirect('/ical/termine');
    });
  }
});

export default app;
