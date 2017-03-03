const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const service = beans.get('usersService');
const store = beans.get('userstore');

const app = misc.expressAppIn(__dirname);

function showListe(res, next, optionalLastSavedUser) {
  store.allUsers((err, users) => {
    if (err) { return next(err); }
    res.render('liste', {users: users, lastSaved: optionalLastSavedUser});
  });
}

app.get('/', (req, res, next) => {
  showListe(res, next);
});

app.post('/submit', (req, res, next) => {
  service.save(req.body.username, (err, user) => {
    if (err) { return next(err); }
    showListe(res, next, user);
  });
});

module.exports = app;
