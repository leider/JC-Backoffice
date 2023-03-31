import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Message from "jc-shared/mail/message.js";
import MailRule from "jc-shared/mail/mailRule.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";

import config from "jc-shared/commons/simpleConfigure.js";

import store from "jc-backend/lib/veranstaltungen/veranstaltungenstore.js";
import mailstore from "jc-backend/lib/mailsender/mailstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import usersService from "jc-backend/lib/users/usersService.js";

const logger = loggers.get("application");

async function processRules(rules: MailRule[], start: DatumUhrzeit, end: DatumUhrzeit) {
  const maxDay = rules.map((rule) => rule.startAndEndDay(end).end).reduce((day1, day2) => (day1.istNach(day2) ? day1 : day2), end);

  async function sendMail(kaputteVeranstaltungen: Veranstaltung[]) {
    const prefix = config.get("publicUrlPrefix") as string;
    function presseTemplateInternal(veranst: Veranstaltung): string {
      // für interne Mails
      return `### [${veranst.kopf.titelMitPrefix}](${prefix}/vue${veranst.fullyQualifiedUrl}/presse)
#### ${veranst.startDatumUhrzeit.fuerPresse} ${veranst.kopf.presseInEcht}

`;
    }

    const markdownToSend = `## Folgende Veranstaltungen haben noch keinen Pressetext und werden im Laufe der nächsten Woche der Presse angekündigt:

---
${kaputteVeranstaltungen.map((veranst) => presseTemplateInternal(veranst)).join("\n\n---\n")}`;
    const message = new Message({
      subject: "Veranstaltungen ohne Pressetext",
      markdown: markdownToSend,
    });
    const bookingAddresses = await usersService.emailsAllerBookingUser();
    logger.info(`Email Adressen für fehlende Pressetexte: ${bookingAddresses}`);
    message.setBcc(bookingAddresses);
    return mailtransport.sendMail(message);
  }

  const veranstaltungen = await store.byDateRangeInAscendingOrder(start, maxDay);
  const zuSendende = veranstaltungen.filter((veranstaltung) => !veranstaltung.presse.checked && veranstaltung.kopf.confirmed);
  if (zuSendende.length === 0) {
    return;
  } else {
    return sendMail(zuSendende);
  }
}

export async function checkPressetexte(now: DatumUhrzeit) {
  const start = now;
  const end = start.plus({ tage: 1 }); // Eine Woche im Voraus

  const rules = await mailstore.all();
  const relevantRules = rules.filter((rule) => rule.shouldSendUntil(start, end));
  return processRules(relevantRules, start, end);
}
