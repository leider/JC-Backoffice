const conf = require('simple-configure');

const beans = conf.get('beans');
const store = beans.get('veranstaltungenstore');
const misc = beans.get('misc');
const puppeteerPrinter = beans.get('puppeteerPrinter');
const DatumUhrzeit = beans.get('DatumUhrzeit');

const app = misc.expressAppIn(__dirname);

const publicUrlPrefix = conf.get('publicUrlPrefix');

const printoptions = {
  format: 'A4',
  landscape: false, // portrait or landscape
  scale: 1.31,
  margin: {top: '20mm', bottom: '10mm', left: '17mm', right: '17mm'}
};

function renderVertrag(language, buyoutInclusive, req, res, next) {
  if (!res.locals.accessrights.isBookingTeam()) {
    return res.redirect('/');
  }
  store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
    if (err1) { return next(err1); }
    if (!veranstaltung) {
      return res.redirect('/');
    }
    app.render(language, {
      veranstaltung,
      datum: new DatumUhrzeit(),
      buyoutInclusive,
      publicUrlPrefix: publicUrlPrefix
    }, puppeteerPrinter.generatePdf(printoptions, res, next));
    // res.render(language, {veranstaltung, datum: moment(), buyoutInclusive, publicUrlPrefix: publicUrlPrefix});
  });
}

app.get('/:url/:language', (req, res, next) => {
  // language -> Deutsch, Englisch, Regional
  const language = req.params.language.toLowerCase();
  const sprache = language === 'regional' ? 'deutsch' : language;
  renderVertrag(sprache, language !== 'regional', req, res, next);
});

module.exports = app;
