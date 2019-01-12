const config = require('simple-configure');
const beans = config.get('beans');
const moment = require('moment-timezone');
const async = require('async');
const logger = require('winston').loggers.get('application');

const store = beans.get('veranstaltungenstore');
const userstore = beans.get('userstore');
const mailstore = beans.get('mailstore');
const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');
const misc = beans.get('misc');
const usersService = beans.get('usersService');

function loadRulesAndProcess(callbackOuter) {
  var counter = 0;
  const now = moment();

  function processRule(rule, callback) {
    const startAndEndDay = rule.startAndEndDay(now);

    function sendMail(selected, callbackInner) {
      const markdownToSend = rule.markdown() + '\n\n---\n' + selected.map(veranst => veranst.presseTextForMail()).join('\n\n---\n');
      const message = new Message({subject: rule.subject(now), markdown: markdownToSend});
      const mailAddress = Message.formatEMailAddress(rule.name(), rule.email());
      logger.info('Email Adressen für Presseregeln: ' + mailAddress);
      message.setTo(mailAddress);
      counter++;
      mailtransport.sendMail(message, callbackInner);
    }

    store.byDateRangeInAscendingOrder(startAndEndDay.start, startAndEndDay.end, (err1, veranstaltungen) => {
      if (err1) {return;}
      const zuSendende = veranstaltungen.filter(veranstaltung => veranstaltung.isSendable());
      if (zuSendende.length === 0) {
        return callback();
      }
      sendMail(zuSendende, callback);
    });
  }

  mailstore.all((err, rules) => {
    if (err) {return;}
    const relevantRules = rules.filter(rule => rule.shouldSend(now));
    async.each(relevantRules, processRule, errFinal => {
      return callbackOuter(errFinal, counter);
    });
  });
}

function checkPressetexte(callbackOuter) {
  const end = moment();
  end.add(7, 'd'); // Eine Woche im Voraus

  function processRules(rules, callback) {
    const maxDay = rules.map(rule => rule.startAndEndDay(end).end).reduce((day1, day2) => day1.isAfter(day2) ? day1 : day2, end);

    function sendMail(kaputteVeranstaltungen, callbackInner) {
      const markdownToSend = '## Folgende Veranstaltungen haben noch keinen Pressetext und werden im Laufe der nächsten Woche der Presse angekündigt:' +
        '\n\n---\n' + kaputteVeranstaltungen.map(veranst => veranst.presseTemplateInternal()).join('\n\n---\n');
      const message = new Message({subject: 'Veranstaltungen ohne Pressetext', markdown: markdownToSend});
      usersService.emailsAllerBookingUser((err, bookingAddresses) => {
        logger.info('Email Adressen für fehlende Pressetexte: ' + bookingAddresses);
        message.setBcc(bookingAddresses);
        mailtransport.sendMail(message, callbackInner);
      });
    }

    store.byDateRangeInAscendingOrder(moment(), maxDay, (err1, veranstaltungen) => {
      if (err1) {return;}
      const zuSendende = veranstaltungen.filter(veranstaltung => !veranstaltung.presse().checked() && veranstaltung.kopf().confirmed());
      if (zuSendende.length === 0) {
        return callback();
      }
      sendMail(zuSendende, callback);
    });
  }

  mailstore.all((err, rules) => {
    if (err) {return;}
    const relevantRules = rules.filter(rule => rule.shouldSendUntil(moment(), end));
    processRules(relevantRules, callbackOuter);
  });
}

function checkKasse(callback) {
  const end = moment();
  end.add(7, 'd'); // Eine Woche im Voraus

  function sendMail(kaputteVeranstaltungen, callbackInner) {
    const markdownToSend = '## Bei folgenden Veranstaltungen der nächsten 8 Tage fehlt noch jemand an der Kasse:' +
      '\n\n---\n' + kaputteVeranstaltungen.map(veranst => {
        return '<a href="' + misc.toFullQualifiedUrl('veranstaltungen', encodeURIComponent(veranst.url())) + '">' +
          veranst.kopf().titel() + ' am ' + veranst.datumForDisplayShort() + ' ' + veranst.kopf().presseIn() +
          '</a>';
      }).join('\n\n---\n') + '\n\n --- \n' +
      '<a href="' + misc.toFullQualifiedUrl('teamseite', '') + '">Zur Teamseite</a>';
    const message = new Message({subject: 'Kassenpersonal für Veranstaltungen gesucht', markdown: markdownToSend});

    userstore.allUsers((err, users) => {
      if (err) { return callback(err); }
      const validUsers = users.filter(user => !!user.email);
      const emails = validUsers.map(user => Message.formatEMailAddress(user.name, user.email));
      logger.info('Email Adressen für fehlende Kasse: ' + emails);
      message.setBcc(emails);
      mailtransport.sendMail(message, callbackInner);
    });
  }

  store.byDateRangeInAscendingOrder(moment(), end, (err1, veranstaltungen) => {
    if (err1) {return;}
    const zuSendende = veranstaltungen.filter(veranstaltung => veranstaltung.kasseFehlt());
    if (zuSendende.length === 0) {
      return callback();
    }
    sendMail(zuSendende, callback);
  });

}

function checkFluegel(callback) {
  if (moment().day() !== 0) { // Sonntag
    return callback();
  }
  const stimmerName = config.get('stimmer-name');
  const stimmerEmail = config.get('stimmer-email');
  if (!stimmerName || !stimmerEmail) {
    return callback();
  }
  const end = moment();
  end.add(6, 'w'); // Sechs Wochen im Voraus

  function sendMail(veranstaltungenMitFluegel, callbackInner) {
    const markdownToSend = '## Bei folgenden Veranstaltungen brauchen wir einen Klavierstimmer:' +
      '\n\n---\n' + veranstaltungenMitFluegel.map(veranst => {
        return veranst.kopf().titel() + ' am ' + veranst.datumForDisplayShort() + ' ' + veranst.kopf().presseIn();
      }).join('\n\n---\n');
    const message = new Message({subject: 'Flügelstimmen im Jazzclub', markdown: markdownToSend});

    usersService.emailsAllerBookingUser((err, bookingAddresses) => {
      if (err) { return callback(err); }
      logger.info('Email Adressen für Flügelstimmen: ' + bookingAddresses);
      message.setTo([Message.formatEMailAddress(stimmerName, stimmerEmail)]);
      message.setBcc(bookingAddresses);
      mailtransport.sendMail(message, callbackInner);
    });
  }

  store.byDateRangeInAscendingOrder(moment(), end, (err1, veranstaltungen) => {
    if (err1) {return;}
    const zuSendende = veranstaltungen.filter(veranstaltung => veranstaltung.technik().fluegel() === 'on');
    if (zuSendende.length === 0) {
      return callback();
    }
    sendMail(zuSendende, callback);
  });
}

module.exports = {
  loadRulesAndProcess,
  checkPressetexte,
  checkKasse,
  checkFluegel
};
