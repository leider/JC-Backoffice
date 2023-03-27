import { loggers } from "winston";
const logger = loggers.get("application");

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Message from "jc-shared/mail/message";
import MailRule from "jc-shared/mail/mailRule";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

import store from "jc-backend/lib/veranstaltungen/veranstaltungenstore";
import mailstore from "jc-backend/lib/mailsender/mailstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";
import conf from "jc-shared/commons/simpleConfigure";
import VeranstaltungFormatter from "jc-shared/veranstaltung/veranstaltungFormatter";

function isSendable(veranstaltung: Veranstaltung): boolean {
  return veranstaltung.presse.checked && veranstaltung.kopf.confirmed;
}

export async function loadRulesAndProcess(now: DatumUhrzeit) {
  const markdownForRules = `### Automatischer Mailversand des Jazzclub Karlruhe e.V.
Diese Mail ist automatisch generiert. Bitte informieren Sie uns über Verbesserungen oder Änderungswünsche, speziell bzgl. des Sendedatums, der Sendeperiode und des Anfangs- und Endezeitraums.

Liebe Grüße vom Jazzclub Team.`;

  let counter = 0;

  async function processRule(rule: MailRule) {
    const startAndEndDay = rule.startAndEndDay(now);

    async function sendMail(selected: Veranstaltung[]) {
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
      return mailtransport.sendMail(message);
    }

    const veranstaltungen = await store.byDateRangeInAscendingOrder(startAndEndDay.start, startAndEndDay.end);
    const zuSendende = veranstaltungen.filter((veranstaltung) => isSendable(veranstaltung));
    if (zuSendende.length === 0) {
      return;
    } else {
      return sendMail(zuSendende);
    }
  }

  const rules = await mailstore.all();
  const relevantRules = rules.filter((rule) => rule.shouldSend(now));
  await Promise.all(relevantRules.map(processRule));
  return counter;
}
