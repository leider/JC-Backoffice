const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('veranstaltungenstore');
const icalService = beans.get('icalService');

const app = misc.expressAppIn(__dirname);

function sendCalendarStringNamedToResult(ical, filename, res) {
  res.type('text/calendar; charset=utf-8');
  res.header('Content-Disposition', 'inline; filename=' + filename + '.ics');
  res.send(ical.toString());
}

app.get('/', (req, res, next) => {
  store.zukuenftige((err, veranstaltungen) => {
    if (err || !veranstaltungen) { return next(err); }
    sendCalendarStringNamedToResult(
      icalService.icalForVeranstaltungen(veranstaltungen.filter(v => v.kopf().confirmed())),
      'events',
      res
    );
  });
});

module.exports = app;
