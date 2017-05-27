const conf = require('simple-configure');

const beans = conf.get('beans');
const store = beans.get('veranstaltungenstore');
const misc = beans.get('misc');

const app = misc.expressAppIn(__dirname);

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
  store.zukuenftige((err, veranstaltungen) => {
    if (err) { return next(err); }
    const event = Object.keys(req.body.event);
    const selected = veranstaltungen.filter(veranst => event.includes(veranst.id()));

    res.render('meldung', {events: selected});
  });
});

app.post('/nach', (req, res, next) => {
  store.vergangene((err, veranstaltungen) => {
    if (err) { return next(err); }
    const event = Object.keys(req.body.event);
    const selected = veranstaltungen.filter(veranst => event.includes(veranst.id()));

    res.render('nachmeldung', {events: selected});
  });
});

module.exports = app;
