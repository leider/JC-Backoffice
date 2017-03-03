const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const service = beans.get('optionenService');
const store = beans.get('optionenstore');

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res, next) => {
  service.optionen((err, optionen) => {
    if (err) { return next(err); }
    res.render('optionen', {optionen: optionen});
  });
});

app.get('/agenturForAuswahl', (req, res) => {
  service.agenturForAuswahl(req.query.auswahl, (err, kontakt) => res.send(kontakt));
})

app.post('/submit', (req, res, next) => {
  service.optionen((err, optionen) => {
    if (err) { return next(err); }
    res.render('optionen', {optionen: optionen});
    optionen.fillFromUI(req.body);
    store.save(optionen, err1 => {
      if (err1) { return next(err1); }
      res.redirect('/optionen');
    });
  });
});

module.exports = app;
