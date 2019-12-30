import mailstore from './mailstore';

import optionenService from '../optionen/optionenService';
import store from '../veranstaltungen/veranstaltungenstore';
import optionenstore from '../optionen/optionenstore';

import misc from '../commons/misc';
import MailRule from './mailRule';
import Message from './message';
import mailtransport from './mailtransport';
import EmailAddresses from '../optionen/emailAddresses';
import Veranstaltung from '../veranstaltungen/object/veranstaltung';

const app = misc.expressAppIn(__dirname);

app.get('/', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  mailstore.all((err: Error | null, rules: MailRule[]) => {
    if (err) {
      return next(err);
    }
    res.render('index', { rules: rules });
  });
});

app.get('/new', (req, res) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  res.render('edit', { rule: new MailRule() });
});

app.get('/compose', (req, res, next) => {
  // LEGACY
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  optionenService.emailAddresses(
    (err: Error | null, emailAddresses: EmailAddresses) => {
      if (err) {
        return next(err);
      }
      store.zukuenftige(
        (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
          if (err1) {
            return next(err1);
          }
          res.render('compose', {
            upcomingEvents: veranstaltungen,
            optionen: emailAddresses
          });
        }
      );
    }
  );
});

app.get('/emailAddresses', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }

  optionenService.emailAddresses(
    (err: Error | null, emailAddresses: EmailAddresses) => {
      if (err) {
        return next(err);
      }
      res.render('emailAddresses', { emailAddresses });
    }
  );
});

app.get('/:id', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  mailstore.forId(req.params.id, (err: Error | null, rule: MailRule) => {
    if (err) {
      return next(err);
    }
    res.render('edit', { rule: rule });
  });
});

app.post('/submitEmailAddresses', (req, res, next) => {
  if (!res.locals.accessrights.isOrgaTeam()) {
    return res.redirect('/');
  }
  optionenService.emailAddresses(
    (err: Error | null, emailAddresses: EmailAddresses) => {
      if (err) {
        return next(err);
      }
      emailAddresses.fillFromUI(req.body);
      optionenstore.save(emailAddresses, (err1: Error | null) => {
        if (err1) {
          return next(err1);
        }
        res.redirect('/');
      });
    }
  );
});

app.post('/save', (req, res, next) => {
  if (!res.locals.accessrights.isSuperuser()) {
    return res.redirect('/');
  }
  mailstore.forId(req.body.id, (err: Error | null, rule: MailRule) => {
    if (err) {
      return next(err);
    }
    const ruleToSave = rule || new MailRule();
    ruleToSave.fillFromUI(req.body);
    mailstore.save(ruleToSave, (err1: Error | null) => {
      if (err1) {
        return next(err1);
      }
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

  optionenService.emailAddresses(
    (err: Error | null, emailAddresses: EmailAddresses) => {
      if (err) {
        return next(err);
      }

      const emails = Object.keys(req.body.partner).map(address => {
        const index = address.substring(5, address.length);
        return Message.formatEMailAddress(
          emailAddresses.partnerForIndex(Number(index)),
          emailAddresses.emailForIndex(Number(index))
        );
      });

      store.zukuenftige(
        (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
          if (err1) {
            return next(err1);
          }
          const event = Object.keys(req.body.event);
          const selected = veranstaltungen.filter(veranst =>
            event.includes(veranst.id())
          );
          const markdownToSend =
            req.body.markdown +
            '\n\n---\n' +
            selected
              .map(veranst => veranst.presseTextForMail())
              .join('\n\n---\n');
          const message = new Message({
            subject: req.body.subject,
            markdown: markdownToSend
          });
          message.setTo(emails);
          mailtransport.sendMail(message, (err2: Error | null) => {
            if (err2) {
              return next(err2);
            }
            return res.redirect('/veranstaltungen/zukuenftige');
          });
        }
      );
    }
  );
});

export default app;
