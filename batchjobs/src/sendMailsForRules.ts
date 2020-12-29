import async from "async";
import { loggers } from "winston";
const logger = loggers.get("application");

import DatumUhrzeit from "../../shared/commons/DatumUhrzeit";
import Message from "../../shared/mail/message";
import MailRule from "../../shared/mail/mailRule";
import Veranstaltung from "../../shared/veranstaltung/veranstaltung";

import store from "../../backend/lib/veranstaltungen/veranstaltungenstore";
import mailstore from "../../backend/lib/mailsender/mailstore";
import mailtransport from "../../backend/lib/mailsender/mailtransport";
import conf from "../../backend/lib/commons/simpleConfigure";
import VeranstaltungFormatter from "../../shared/veranstaltung/veranstaltungFormatter";

function isSendable(veranstaltung: Veranstaltung): boolean {
  return veranstaltung.presse.checked && veranstaltung.kopf.confirmed;
}

export function loadRulesAndProcess(now: DatumUhrzeit, callbackOuter: Function): void {
  const markdownForRules = `### Automatischer Mailversand des Jazzclub Karlruhe e.V.
Diese Mail ist automatisch generiert. Bitte informieren Sie uns über Verbesserungen oder Änderungswünsche, speziell bzgl. des Sendedatums, der Sendeperiode und des Anfangs- und Endezeitraums.

Liebe Grüße vom Jazzclub Team.`;

  let counter = 0;

  function processRule(rule: MailRule, callback: Function): void {
    const startAndEndDay = rule.startAndEndDay(now);

    function sendMail(selected: Veranstaltung[], callbackInner: Function): void {
      const markdownToSend =
        markdownForRules +
        "\n\n---\n" +
        selected
          .map((veranst) => new VeranstaltungFormatter(veranst).presseTextForMail(conf.get("publicUrlPrefix") as string))
          .join("\n\n---\n");
      const message = new Message({
        subject: rule.subject(now),
        markdown: markdownToSend,
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
      const zuSendende = veranstaltungen.filter((veranstaltung) => isSendable(veranstaltung));
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
    const relevantRules = rules.filter((rule) => rule.shouldSend(now));
    async.each(relevantRules, processRule, (errFinal) => {
      callbackOuter(errFinal, counter);
    });
  });
}
