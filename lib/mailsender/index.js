const beans = require('simple-configure').get('beans');

const misc = beans.get('misc');
const optionenService = beans.get('optionenService');
const store = beans.get('veranstaltungenstore');

const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res, next) => {
  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }
    store.zukuenftige((err1, veranstaltungen) => {
      if (err1) { return next(err1); }
      res.render('compose', {upcomingEvents: veranstaltungen, optionen: optionen});
    });
  });
});

app.post('/send', (req, res, next) => {
  if (!req.body.event || !req.body.partner) {
    return res.redirect('/veranstaltungen/zukuenftige');
  }

  optionenService.optionen((err, optionen) => {
    if (err) { return next(err); }

    const emails = Object.keys(req.body.partner).map(address => {
      const index = address.substring(address.length - 1, address.length);
      return Message.formatEMailAddress(optionen['partner' + index](), optionen[address]());
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
