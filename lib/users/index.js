const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const service = beans.get('usersService');
const store = beans.get('userstore');
const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');
const statusmessage = beans.get('statusmessage');

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

app.get('/rundmail', (req, res) => {
  res.render('rundmail');
});

app.post('/rundmail', (req, res, next) => {
  store.allUsers((err, users) => {
    if (err) { return next(err); }
    const validUsers = users.filter(user => !!user.email);
    const emails = validUsers.map(user => Message.formatEMailAddress(user.name, user.email));
    const markdownToSend = req.body.markdown;
    const currentUser = validUsers.find(user => user.id === req.user.id);
    if (!validUsers || !currentUser) {
      return next(new Error('Fehler beim Senden'));
    }
    const message = new Message({subject: '[Jazzclub B-O] Rundmail', markdown: markdownToSend}, currentUser.name, currentUser.email);
    message.setTo(emails);
    mailtransport.sendMail(message, err1 => {
      if (err1) { return next(err1); }
      statusmessage.successMessage('Gesendet', 'Deine Mail wurde an alle geschickt').putIntoSession(req);
      return res.redirect('/users');
    });
  });

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
    user.gruppen = misc.toArray(req.body.gruppen);
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
