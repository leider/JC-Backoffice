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

app.get('/:id', (req, res, next) => {
  store.forId(req.params.id, (err, user) => {
    if (err) { return next(err); }
    res.render('edit', {user: user});
  });
});

app.post('/submit', (req, res, next) => {
  const userid = req.body.id;
  store.forId(userid, (err, user) => {
    if (err) { return next(err); }
    user.name = req.body.name;
    user.email = req.body.email;
    store.save(user, err1 => {
      if (err1) { return next(err1); }
      showListe(res, next);
    });
  });
});

app.post('/submitNew', (req, res, next) => {
  service.saveNewUser(req.body.username, (err, user) => {
    if (err) { return next(err); }
    showListe(res, next, user);
  });
});

module.exports = app;
