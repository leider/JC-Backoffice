const conf = require('simple-configure');
const beans = conf.get('beans');
const store = beans.get('veranstaltungenstore');
const misc = beans.get('misc');
const puppeteerPrinter = beans.get('puppeteerPrinter');

const app = misc.expressAppIn(__dirname);

const publicUrlPrefix = conf.get('publicUrlPrefix');

const printoptions = {
  format: 'A4',
  landscape: true, // portrait or landscape
  scale: 1.1,
  margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
};

function createCSV(nachmeldung, events) {
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

function createResult(req, res, next, selector, nachmeldung) {
  store[selector]((err, veranstaltungen) => {
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

app.get('/', (req, res, next) => {
  store.zukuenftige((err, zukuenftige) => {
    if (err) {
      return next(err);
    }
    store.vergangene((err1, vergangene) => {
      if (err1) {
        return next(err1);
      }
      res.render('choose', {
        upcomingEvents: zukuenftige,
        pastEvents: vergangene
      });
    });
  });
});

app.post('/vorab', (req, res, next) => {
  if (!req.body.event) {
    return res.redirect('/gema');
  }
  createResult(req, res, next, 'zukuenftige', false);
});

app.post('/nach', (req, res, next) => {
  if (!req.body.event) {
    return res.redirect('/gema');
  }
  createResult(req, res, next, 'vergangene', true);
});

module.exports = app;
