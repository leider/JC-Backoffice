const beans = require('simple-configure').get('beans');
const moment = require('moment-timezone');
const async = require('async');

const store = beans.get('veranstaltungenstore');
const mailstore = beans.get('mailstore');
const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');

function loadRulesAndProcess(callbackOuter) {
  var counter = 0;
  const now = moment();

  function processRule(rule, callback) {
    const startAndEndDay = rule.startAndEndDay(now);

    function sendMail(selected, callbackInner) {
      const markdownToSend = rule.markdown() + '\n\n---\n' + selected.map(veranst => veranst.presseTextForMail()).join('\n\n---\n');
      const message = new Message({subject: rule.subject(now), markdown: markdownToSend});
      message.setTo(Message.formatEMailAddress(rule.name(), rule.email()));
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

function checkVeranstaltungen(callbackOuter) {
  const end = moment();
  end.add(7, 'd'); // Eine Woche im Voraus

  function processRules(rules, callback) {
    const maxDay = rules.map(rule => rule.startAndEndDay(end).end).reduce((day1, day2) => day1.isAfter(day2) ? day1 : day2, end);

    function sendMail(kaputteVeranstaltungen, callbackInner) {
      const markdownToSend = '## Folgende Veranstaltungen haben noch keinen Pressetext und werden im Laufe der nächsten Woche der Presse angekündigt:' +
        '\n\n---\n' + kaputteVeranstaltungen.map(veranst => veranst.presseTemplateInternal()).join('\n\n---\n');
      const message = new Message({subject: 'Veranstaltungen ohne Pressetext', markdown: markdownToSend});
      beans.get('usersService').emailsAllerBookingUser((err, bookingAddresses) => {
        message.setTo(Message.formatEMailAddress('Booking', bookingAddresses));
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

module.exports = {
  loadRulesAndProcess,
  checkVeranstaltungen
};
