const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const store = beans.get('veranstaltungenstore');

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res, next) => {
  store.zukuenftige((err, veranstaltungen) => {
    if (err) { return next(err); }
    res.render('index', {veranstaltungen: veranstaltungen.filter(v => v.kopf().confirmed())});
  });
});

module.exports = app;
