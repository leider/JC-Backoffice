const beans = require('simple-configure').get('beans');

const misc = beans.get('misc');
const optionenService = beans.get('optionenService');
const store = beans.get('veranstaltungenstore');
const mailstore = beans.get('mailstore');
const optionenstore = beans.get('optionenstore');

const Message = beans.get('message');
const MailRule = beans.get('mailRule');
const mailtransport = beans.get('mailtransport');

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  mailstore.all((err, rules) => {
    if (err) { return next(err); }
    res.render('index', {rules: rules});
  });
});

app.get('/new', (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  res.render('edit', {rule: new MailRule()});
});

app.get('/compose', (req, res, next) => { // LEGACY
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  optionenService.emailAddresses((err, emailAddresses) => {
    if (err) { return next(err); }
    store.zukuenftige((err1, veranstaltungen) => {
      if (err1) { return next(err1); }
      res.render('compose', {upcomingEvents: veranstaltungen, optionen: emailAddresses});
    });
  });
});

app.get('/emailAddresses', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  optionenService.emailAddresses((err, emailAddresses) => {
    if (err) { return next(err); }
    res.render('emailAddresses', {emailAddresses});
  });
});

app.get('/:id', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  mailstore.forId(req.params.id, (err, rule) => {
    if (err) { return next(err); }
    res.render('edit', {rule: rule});
  });
});

app.post('/submitEmailAddresses', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }
  optionenService.emailAddresses((err, emailAddresses) => {
    if (err) { return next(err); }
    emailAddresses.fillFromUI(req.body);
    optionenstore.save(emailAddresses, err1 => {
      if (err1) { return next(err1); }
      res.redirect('/');
    });
  });
});

app.post('/save', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  mailstore.forId(req.body.id, (err, rule) => {
    if (err) { return next(err); }
    const ruleToSave = rule || new MailRule();
    ruleToSave.fillFromUI(req.body);
    mailstore.save(ruleToSave, err1 => {
      if (err1) { return next(err1); }
    });
    res.redirect('/mailsender');
  });
});

app.post('/send', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  if (!req.body.event || !req.body.partner) {
    return res.redirect('/veranstaltungen/zukuenftige');
  }

  optionenService.emailAddresses((err, emailAddresses) => {
    if (err) { return next(err); }

    const emails = Object.keys(req.body.partner).map(address => {
      const index = address.substring(5, address.length);
      return Message.formatEMailAddress(emailAddresses.state['partner' + index], emailAddresses.state['email' + index]);
    });

    store.zukuenftige((err1, veranstaltungen) => {
      if (err1) { return next(err1); }
      const event = Object.keys(req.body.event);
      const selected = veranstaltungen.filter(veranst => event.includes(veranst.id()));
      const markdownToSend = req.body.markdown + '\n\n---\n' + selected.map(veranst => veranst.presseTextForMail()).join('\n\n---\n');
      const message = new Message({subject: req.body.subject, markdown: markdownToSend});
      message.setTo(emails);
      mailtransport.sendMail(message, err2 => {
        if (err2) { return next(err2); }
        return res.redirect('/veranstaltungen/zukuenftige');
      });
    });

  });

});

module.exports = app;
