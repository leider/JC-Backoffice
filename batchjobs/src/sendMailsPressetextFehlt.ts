import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Message from "jc-shared/mail/message";
import MailRule from "jc-shared/mail/mailRule";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

import config from "jc-backend/lib/commons/simpleConfigure";

import store from "jc-backend/lib/veranstaltungen/veranstaltungenstore";
import mailstore from "jc-backend/lib/mailsender/mailstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";
import usersService from "jc-backend/lib/users/usersService";

const logger = loggers.get("application");

function processRules(rules: MailRule[], start: DatumUhrzeit, end: DatumUhrzeit, callback: Function): void {
  const maxDay = rules.map((rule) => rule.startAndEndDay(end).end).reduce((day1, day2) => (day1.istNach(day2) ? day1 : day2), end);

  async function sendMail(kaputteVeranstaltungen: Veranstaltung[], callbackInner: Function) {
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
    mailtransport.sendMail(message, callbackInner);
  }

  store.byDateRangeInAscendingOrder(start, maxDay, (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err1) {
      return;
    }
    const zuSendende = veranstaltungen.filter((veranstaltung) => !veranstaltung.presse.checked && veranstaltung.kopf.confirmed);
    if (zuSendende.length === 0) {
      callback();
    } else {
      sendMail(zuSendende, callback);
    }
  });
}

export async function checkPressetexte(now: DatumUhrzeit, callback: Function) {
  const start = now;
  const end = start.plus({ tage: 1 }); // Eine Woche im Voraus

  try {
    const rules = await mailstore.all();
    const relevantRules = rules.filter((rule) => rule.shouldSendUntil(start, end));
    processRules(relevantRules, start, end, callback);
  } catch (e) {
    callback();
  }
}
