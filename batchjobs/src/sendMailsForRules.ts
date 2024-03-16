import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Message from "jc-shared/mail/message.js";
import MailRule from "jc-shared/mail/mailRule.js";
import mailstore from "jc-backend/lib/mailsender/mailstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import conf from "jc-shared/commons/simpleConfigure.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";
import VeranstaltungFormatter from "jc-shared/veranstaltung/VeranstaltungFormatter.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";

const logger = loggers.get("application");

function isSendable(ver: Veranstaltung): boolean {
  const satisfied = ver.presse.checked && ver.kopf.confirmed;
  if (ver.isVermietung) {
    return (ver as Vermietung).brauchtPresse && satisfied;
  }
  return satisfied;
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
          .map((veranst) => {
            return new VeranstaltungFormatter(veranst).presseTextForMail(conf.publicUrlPrefix);
          })
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

    const zuSendende = await byDateRangeInAscendingOrder({
      from: startAndEndDay.start,
      to: startAndEndDay.end,
      konzerteFilter: isSendable,
      vermietungenFilter: isSendable,
    });

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
