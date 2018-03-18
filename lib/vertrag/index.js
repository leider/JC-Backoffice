const conf = require('simple-configure');
const pdf = require('html-pdf');
const moment = require('moment-timezone');

const beans = conf.get('beans');
const store = beans.get('veranstaltungenstore');
const misc = beans.get('misc');

const app = misc.expressAppIn(__dirname);

function htmlToPdfAndOut(res, next) {
  return (err, html) => {
    if (err) { return next(err); }
    const options = {
      format: 'A4',
      orientation: 'portrait', // portrait or landscape
      base: 'file://' + __dirname + '/../../',
      border: {
        top: '20mm', // default is 0, units: mm, cm, in, px
        right: '17mm',
        bottom: '10mm',
        left: '17mm'
      },
      phantomArgs: ['--local-to-remote-url-access=true']
    };
    pdf.create(html, options).toBuffer((err1, buffer) => {
      if (err1) { return next(err1); }
      res.set('Content-Type', 'application/pdf');
      res.send(buffer);
    });
  };
}

app.get('/:url/deutsch', (req, res, next) => {
  if (!res.locals.accessrights.isBookingTeam()) {
    return res.redirect('/');
  }
  store.getVeranstaltung(req.params.url, (err1, veranstaltung) => {
    if (err1) { return next(err1); }
    if (!veranstaltung) {
      return res.redirect('/');
    }
    app.render('deutsch', {veranstaltung, datum: moment()}, htmlToPdfAndOut(res, next));
  });
});

module.exports = app;
