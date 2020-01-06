import DatumUhrzeit from "../commons/DatumUhrzeit";

import async from "async";
import { loggers } from "winston";
const logger = loggers.get("application");

import store from "../veranstaltungen/veranstaltungenstore";
import mailstore from "./mailstore";
import Message from "./message";
import mailtransport from "./mailtransport";
import MailRule from "./mailRule";
import Veranstaltung from "../veranstaltungen/object/veranstaltung";

export function loadRulesAndProcess(now: DatumUhrzeit, callbackOuter: Function): void {
  const markdownForRules = `### Automatischer Mailversand des Jazzclub Karlruhe e.V.
Diese Mail ist automatisch generiert. Bitte informieren Sie uns über Verbesserungen oder Änderungswünsche, speziell bzgl. des Sendedatums, der Sendeperiode und des Anfangs- und Endezeitraums.

Liebe Grüße vom Jazzclub Team.`;

  let counter = 0;

  function processRule(rule: MailRule, callback: Function): void {
    const startAndEndDay = rule.startAndEndDay(now);

    function sendMail(selected: Veranstaltung[], callbackInner: Function): void {
      const markdownToSend = markdownForRules + "\n\n---\n" + selected.map(veranst => veranst.presseTextForMail()).join("\n\n---\n");
      const message = new Message({
        subject: rule.subject(now),
        markdown: markdownToSend
      });
      const mailAddress = Message.formatEMailAddress(rule.name, rule.email);
      logger.info(`Email Adressen für Presseregeln: ${mailAddress}`);
      message.setTo(mailAddress);
      counter++;
      mailtransport.sendMail(message, callbackInner);
    }

    store.byDateRangeInAscendingOrder(startAndEndDay.start, startAndEndDay.end, (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
      if (err1) {
        return;
      }
      const zuSendende = veranstaltungen.filter(veranstaltung => veranstaltung.isSendable());
      if (zuSendende.length === 0) {
        callback();
      } else {
        sendMail(zuSendende, callback);
      }
    });
  }

  mailstore.all((err: Error | null, rules: MailRule[]) => {
    if (err) {
      return;
    }
    const relevantRules = rules.filter(rule => rule.shouldSend(now));
    async.each(relevantRules, processRule, errFinal => {
      callbackOuter(errFinal, counter);
    });
  });
}
