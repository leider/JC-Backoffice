const conf = require('simple-configure');
const beans = conf.get('beans');
const store = beans.get('veranstaltungenstore');
const misc = beans.get('misc');
const puppeteer = require('puppeteer');

const app = misc.expressAppIn(__dirname);

const publicUrlPrefix = conf.get('publicUrlPrefix');

function htmlToPdfAndOutPuppeteer(res, next) {
  return (err, html) => {
    if (err) { return next(err); }
    const options = {
      format: 'A4',
      landscape: true, // portrait or landscape
      scale: 1.1,
      margin: {top: '10mm', bottom: '10mm', left: '10mm', right: '10mm'}
    };
    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.emulateMedia('screen');
      await page.goto(`data:text/html,${html}`, { waitUntil: 'networkidle0' });
      const pdf1 = await page.pdf(options);
      await browser.close();
      res.set('Content-Type', 'application/pdf');
      res.send(pdf1);
    })();
  };
}

app.get('/', (req, res, next) => {
  store.zukuenftige((err, zukuenftige) => {
    if (err) { return next(err); }
    store.vergangene((err1, vergangene) => {
      if (err1) { return next(err1); }
      res.render('choose', {upcomingEvents: zukuenftige, pastEvents: vergangene});
    });
  });
});

app.post('/vorab', (req, res, next) => {
  if (!req.body.event) {
    return res.redirect('/gema');
  }
  store.zukuenftige((err, veranstaltungen) => {
    if (err) { return next(err); }
    const event = Object.keys(req.body.event);
    const selected = veranstaltungen.filter(veranst => event.includes(veranst.id()));

    app.render('meldung', {events: selected, nachmeldung: false, publicUrlPrefix: publicUrlPrefix}, htmlToPdfAndOutPuppeteer(res, next));

  });
});


app.post('/nach', (req, res, next) => {
  if (!req.body.event) {
    return res.redirect('/gema');
  }
  store.vergangene((err, veranstaltungen) => {
    if (err) { return next(err); }
    const event = Object.keys(req.body.event);
    const selected = veranstaltungen.filter(veranst => event.includes(veranst.id()));

    app.render('meldung', {events: selected, nachmeldung: true, publicUrlPrefix: publicUrlPrefix}, htmlToPdfAndOutPuppeteer(res, next));
  });
});

module.exports = app;
