const R = require('ramda');
const conf = require('simple-configure');

const beans = conf.get('beans');
const misc = beans.get('misc');
const service = beans.get('usersService');
const store = beans.get('userstore');
const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');
const statusmessage = beans.get('statusmessage');
const Users = beans.get('users');
const app = misc.expressAppIn(__dirname);

function showListe(res, next, optionalLastSavedUser) {
  store.allUsers((err, users) => {
    if (err) { return next(err); }
    res.render('liste', {users: R.sortBy(R.prop('name'), users), lastSaved: optionalLastSavedUser});
  });
}

app.get('/', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  showListe(res, next);
});

app.get('/rundmail', (req, res) => {
  store.allUsers((err, users) => {
    res.render('rundmail', {users: users.filter(user => !!user.email)});
  });
});

app.post('/rundmail', (req, res, next) => {
  store.allUsers((err, users) => {
    if (err) { return next(err); }
    const validUsers = new Users(users).filterReceivers(req.body.group, req.body.user).filter(user => !!user.email);
    const emails = validUsers.map(user => Message.formatEMailAddress(user.name, user.email));
    const markdownToSend = req.body.markdown;
    const currentUser = users.find(user => user.id === req.user.id);
    if (!validUsers || !currentUser) {
      return next(new Error('Fehler beim Senden'));
    }
    const message = new Message({
      subject: req.body.subject,
      markdown: markdownToSend
    }, currentUser.name, currentUser.email);
    message.setBcc(emails);
    mailtransport.sendMail(message, err1 => {
      if (err1) { return next(err1); }
      statusmessage.successMessage('Gesendet', 'Deine Mail wurde an geschickt').putIntoSession(req);
      return res.redirect('/users/rundmail');
    });
  });

});

app.get('/tshirt-size-for', (req, res) => {
  const userid = req.query.user;
  const value = req.query.value;
  store.forId(userid, (err, user) => {
    if (err) { return res.send(false); }
    user.tshirt = value;
    store.save(user, err1 => {
      if (err1) { return res.send(false); }
      res.send(true);
    });
  });
});

app.get('/tel-for', (req, res) => {
  const userid = req.query.user;
  const value = req.query.value;
  store.forId(userid, (err, user) => {
    if (err) { return res.send(false); }
    user.tel = value;
    store.save(user, err1 => {
      if (err1) { return res.send(false); }
      res.send(true);
    });
  });
});

app.get('/changePassword/:id', (req, res, next) => {
  if (!res.locals.accessrights.canEditUser(req.params.id) && !res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  store.forId(req.params.id, (err, user) => {
    if (err) { return next(err); }
    res.render('changePassword', {user: user});
  });
});

app.get('/:id', (req, res, next) => {
  if (!res.locals.accessrights.canEditUser(req.params.id) && !res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  store.forId(req.params.id, (err, user) => {
    if (err) { return next(err); }
    res.render('edit', {user: user});
  });
});

app.get('/:id/delete', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }

  store.deleteUser(req.params.id, err => {
    if (err) { return next(err); }
    res.redirect('/users');
  });
});

app.post('/submit', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser() && !res.locals.accessrights.memberId() === req.body.id) {
    return res.redirect('/');
  }
  const userid = req.body.id;
  store.forId(userid, (err, user) => {
    if (err) { return next(err); }
    user.name = req.body.name;
    user.email = req.body.email;
    user.tel = req.body.tel;
    user.tshirt = req.body.tshirt;
    user.gruppen = misc.toArray(req.body.gruppen);
    user.rechte = misc.toArray(req.body.rechte);
    store.save(user, err1 => {
      if (err1) { return next(err1); }
      showListe(res, next);
    });
  });
});

app.post('/newPassword', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser() && !res.locals.accessrights.memberId() === req.body.id) {
    return res.redirect('/');
  }
  service.updatePassword(req.body.id, req.body.passwort, (err, user) => {
    if (err) { return next(err); }
    showListe(res, next, user);
  });
});

app.post('/submitNew', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  service.saveNewUser(req.body.username, (err, user) => {
    if (err) { return next(err); }
    showListe(res, next, user);
  });
});

module.exports = app;
