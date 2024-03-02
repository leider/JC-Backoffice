import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Message from "jc-shared/mail/message.js";
import MailRule from "jc-shared/mail/mailRule.js";

import config from "jc-shared/commons/simpleConfigure.js";
import mailstore from "jc-backend/lib/mailsender/mailstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import usersService from "jc-backend/lib/users/usersService.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";

const logger = loggers.get("application");

async function processRules(rules: MailRule[], start: DatumUhrzeit, end: DatumUhrzeit) {
  const maxDay = rules.map((rule) => rule.startAndEndDay(end).end).reduce((day1, day2) => (day1.istNach(day2) ? day1 : day2), end);

  async function sendMail(kaputte: Veranstaltung[]) {
    const prefix = config.getString("publicUrlPrefix");
    function presseTemplateInternal(ver: Veranstaltung): string {
      // für interne Mails
      return `### [${ver.kopf.titelMitPrefix}](${prefix}/vue${ver.fullyQualifiedUrl}?page=presse)
#### ${ver.startDatumUhrzeit.fuerPresse} ${ver.kopf.presseInEcht}

`;
    }

    const markdownToSend = `## Folgende Veranstaltungen oder Vermietungen haben noch keinen Pressetext und werden im Laufe der nächsten Woche der Presse angekündigt:

---
${kaputte.map((veranst) => presseTemplateInternal(veranst)).join("\n\n---\n")}`;
    const message = new Message({
      subject: "Veranstaltungen ohne Pressetext",
      markdown: markdownToSend,
    });
    const bookingAddresses = await usersService.emailsAllerBookingUser();
    logger.info(`Email Adressen für fehlende Pressetexte: ${bookingAddresses}`);
    message.setBcc(bookingAddresses);
    return mailtransport.sendMail(message);
  }

  const kaputteZuSendende = await byDateRangeInAscendingOrder({
    from: start,
    to: maxDay,
    konzerteFilter: (konzert) => !konzert.presse.checked && konzert.kopf.confirmed,
    vermietungenFilter: (vermietung) => vermietung.brauchtPresse && !vermietung.presse.checked && vermietung.kopf.confirmed,
  });
  if (kaputteZuSendende.length === 0) {
    return;
  } else {
    return sendMail(kaputteZuSendende);
  }
}

export async function checkPressetexte(now: DatumUhrzeit) {
  const start = now;
  const end = start.plus({ tage: 1 }); // Eine Woche im Voraus

  const rules = await mailstore.all();
  const relevantRules = rules.filter((rule) => rule.shouldSendUntil(start, end));
  return processRules(relevantRules, start, end);
}
