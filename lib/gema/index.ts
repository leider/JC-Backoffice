import express from 'express';

import misc from '../commons/misc';
import puppeteerPrinter from '../commons/puppeteerPrinter';

import store from '../veranstaltungen/veranstaltungenstore';

const app = misc.expressAppIn(__dirname);

const conf = require('simple-configure');
const publicUrlPrefix = conf.get('publicUrlPrefix');

const printoptions = {
  format: 'A4',
  landscape: true, // portrait or landscape
  scale: 1.1,
  margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
};

function createCSV(nachmeldung: boolean, events: Array<any>) {
  const header = `Datum;Ort;Kooperation Mit;Veranstaltungsart;Musikwiedergabeart;Eintrittspreis;${
    nachmeldung ? 'Einnahmen;' : ''
  }Anzahl Besucher;Rechnung An;Raumgröße\n`;
  const zeilen = events.map(e => {
    const wiedergabeart =
      e.artist().bandname() ||
      e
        .artist()
        .name()
        .join(', ');
    const rechnungAn = e.kopf().rechnungAnKooperation()
      ? e.kopf().kooperation()
      : 'Jazzclub';
    return `${e.datumForDisplay()};${e
      .kopf()
      .ort()};${e
      .kopf()
      .kooperation()};Jazzkonzert;${wiedergabeart};${e.preisAusweisGema()};${
      nachmeldung ? e.eintrittGema() + ';' : ''
    }${e.anzahlBesucher()};${rechnungAn};${e.kopf().flaeche()}\n`;
  });
  let result = header;
  zeilen.forEach(z => {
    result += z;
  });
  return result;
}

function createResult(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  selector: string,
  nachmeldung: boolean
) {
  // @ts-ignore
  store[selector]((err: Error | null, veranstaltungen: Array<any>) => {
    if (err) {
      return next(err);
    }
    const event = Object.keys(req.body.event);
    const selected = veranstaltungen.filter(veranst =>
      event.includes(veranst.id())
    );
    const dateiart = req.body.dateiart;
    if (dateiart === 'PDF') {
      return app.render(
        'meldung',
        {
          events: selected,
          nachmeldung,
          publicUrlPrefix: publicUrlPrefix
        },
        puppeteerPrinter.generatePdf(printoptions, res, next)
      );
    }
    res.setHeader(
      'Content-disposition',
      'attachment; filename=' +
        (nachmeldung ? 'nachmeldung' : 'vorabmeldung') +
        '.csv'
    );
    res.set('Content-Type', 'text/csv');
    res.send(createCSV(false, selected));
  });
}

app.get(
  '/',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    store.zukuenftige((err: Error | null, zukuenftige: Array<any>) => {
      if (err) {
        return next(err);
      }
      store.vergangene((err1: Error | null, vergangene: Array<any>) => {
        if (err1) {
          return next(err1);
        }
        res.render('choose', {
          upcomingEvents: zukuenftige,
          pastEvents: vergangene
        });
      });
    });
  }
);

app.post(
  '/vorab',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.body.event) {
      return res.redirect('/gema');
    }
    createResult(req, res, next, 'zukuenftige', false);
  }
);

app.post(
  '/nach',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.body.event) {
      return res.redirect('/gema');
    }
    createResult(req, res, next, 'vergangene', true);
  }
);

export default app;
