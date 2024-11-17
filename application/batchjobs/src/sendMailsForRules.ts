import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import MailRule from "jc-shared/mail/mailRule.js";
import mailstore from "jc-backend/lib/mailsender/mailstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import conf from "jc-shared/commons/simpleConfigure.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";
import VeranstaltungFormatter from "jc-shared/veranstaltung/VeranstaltungFormatter.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import MailMessage from "jc-shared/mail/mailMessage.js";

const logger = loggers.get("application");

let counter = 0;

function isSendable(ver: Veranstaltung): boolean {
  return ver.presse.checked && ver.kopf.confirmed && (ver.isVermietung ? (ver as Vermietung).brauchtPresse : true);
}

const markdownForRules = `### Automatischer Mailversand des Jazzclub Karlruhe e.V.
Diese Mail ist automatisch generiert. Bitte informieren Sie uns über Verbesserungen oder Änderungswünsche, speziell bzgl. des Sendedatums, der Sendeperiode und des Anfangs- und Endezeitraums.

Liebe Grüße vom Jazzclub Team.`;

async function sendMail(selected: Veranstaltung[], rule: MailRule, now: DatumUhrzeit) {
  const markdownToSend = `${markdownForRules}

---
${selected
  .map((veranst) => {
    return new VeranstaltungFormatter(veranst).presseTextForMail(conf.publicUrlPrefix);
  })
  .join("\n\n---\n")}`;

  const mailmessage = new MailMessage({ subject: rule.subject(now) });
  mailmessage.body = markdownToSend;
  const mailAddress = MailMessage.formatEMailAddress(rule.name, rule.email);
  logger.info(`Email Adresse für Presseregeln: ${mailAddress}`);
  mailmessage.to = [mailAddress];
  counter++;
  return mailtransport.sendMail(mailmessage);
}

export async function loadRulesAndProcess(now: DatumUhrzeit) {
  async function processRule(rule: MailRule) {
    const startAndEndDay = rule.startAndEndDay(now);

    const zuSendende = byDateRangeInAscendingOrder({
      from: startAndEndDay.start,
      to: startAndEndDay.end,
      konzerteFilter: isSendable,
      vermietungenFilter: isSendable,
    });

    if (zuSendende.length !== 0) {
      return sendMail(zuSendende, rule, now);
    }
  }

  const rules = mailstore.all();
  const relevantRules = rules.filter((rule) => rule.shouldSend(now));
  await relevantRules.map(processRule);
  return counter;
}
