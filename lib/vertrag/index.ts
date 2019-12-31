import express from 'express';
import store from '../veranstaltungen/veranstaltungenstore';
import misc from '../commons/misc';
import puppeteerPrinter from '../commons/puppeteerPrinter';
import DatumUhrzeit from '../commons/DatumUhrzeit';
import Veranstaltung from '../veranstaltungen/object/veranstaltung';
import { PDFOptions } from 'puppeteer';

const app = misc.expressAppIn(__dirname);

import conf from '../commons/simpleConfigure';
const publicUrlPrefix = conf.get('publicUrlPrefix');

const printoptions: PDFOptions = {
  format: 'A4',
  landscape: false, // portrait or landscape
  scale: 1.31,
  margin: { top: '20mm', bottom: '10mm', left: '17mm', right: '17mm' }
};

function renderVertrag(
  language: string,
  buyoutInclusive: boolean,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (!res.locals.accessrights.isBookingTeam()) {
    return res.redirect('/');
  }
  return store.getVeranstaltung(
    req.params.url,
    (err1: Error | null, veranstaltung?: Veranstaltung) => {
      if (err1) {
        return next(err1);
      }
      if (!veranstaltung) {
        return res.redirect('/');
      }
      return app.render(
        language,
        {
          veranstaltung,
          datum: new DatumUhrzeit(),
          buyoutInclusive,
          publicUrlPrefix: publicUrlPrefix
        },
        puppeteerPrinter.generatePdf(printoptions, res, next)
      );
      // res.render(language, {veranstaltung, datum: new DatumUhrzeit(), buyoutInclusive, publicUrlPrefix: publicUrlPrefix});
    }
  );
}

app.get('/:url/:language', (req, res, next) => {
  // language -> Deutsch, Englisch, Regional
  const language = req.params.language.toLowerCase();
  const sprache = language === 'regional' ? 'deutsch' : language;
  renderVertrag(sprache, language !== 'regional', req, res, next);
});

export default app;
