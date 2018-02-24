const conf = require('simple-configure');
const pdf = require('html-pdf');
const beans = conf.get('beans');
const store = beans.get('veranstaltungenstore');
const misc = beans.get('misc');

const app = misc.expressAppIn(__dirname);

function htmlToPdfAndOut(res, next) {
  return (err, html) => {
    if (err) { return next(err); }
    const options = {
      format: 'A4',
      orientation: 'landscape', // portrait or landscape
      base: 'file://' + __dirname + '/../../',
      border: '10mm',
      phantomArgs: ['--local-to-remote-url-access=true']
    };
    pdf.create(html, options).toBuffer((err1, buffer) => {
      if (err1) { return next(err1); }
      res.set('Content-Type', 'application/pdf');
      res.send(buffer);
    });
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

    app.render('meldung', {events: selected, nachmeldung: false}, htmlToPdfAndOut(res, next));

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

    app.render('meldung', {events: selected, nachmeldung: true}, htmlToPdfAndOut(res, next));
  });
});

module.exports = app;
