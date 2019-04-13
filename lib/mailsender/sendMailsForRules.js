const config = require('simple-configure');
const beans = config.get('beans');
const moment = require('moment-timezone');
const async = require('async');
const logger = require('winston').loggers.get('application');

const store = beans.get('veranstaltungenstore');
const mailstore = beans.get('mailstore');
const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');

function loadRulesAndProcess(callbackOuter) {
  const markdownForRules = `### Automatischer Mailversand des Jazzclub Karlruhe e.V.
Diese Mail ist automatisch generiert. Bitte informieren Sie uns über Verbesserungen oder Änderungswünsche, speziell bzgl. des Sendedatums, der Sendeperiode und des Anfangs- und Endezeitraums.

Liebe Grüße vom Jazzclub Team.`;

  let counter = 0;
  const now = moment();

  function processRule(rule, callback) {
    const startAndEndDay = rule.startAndEndDay(now);

    function sendMail(selected, callbackInner) {
      const markdownToSend = markdownForRules + '\n\n---\n' + selected.map(veranst => veranst.presseTextForMail()).join('\n\n---\n');
      const message = new Message({subject: rule.subject(now), markdown: markdownToSend});
      const mailAddress = Message.formatEMailAddress(rule.name(), rule.email());
      logger.info(`Email Adressen für Presseregeln: ${mailAddress}`);
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
      callbackOuter(errFinal, counter);
    });
  });
}


module.exports = {
  loadRulesAndProcess
};
