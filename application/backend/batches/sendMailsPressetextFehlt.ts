import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import MailRule from "jc-shared/mail/mailRule.js";

import conf from "../simpleConfigure.js";
import mailstore from "../lib/mailsender/mailstore.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import usersService from "../lib/users/usersService.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import formatMailAddresses from "jc-shared/mail/formatMailAddresses.js";
import { JobResult } from "./index.js";
import map from "lodash/map.js";
import filter from "lodash/filter.js";

const logger = loggers.get("application");

async function sendMail(kaputte: Veranstaltung[]) {
  const prefix = conf.publicUrlPrefix;
  function presseTemplateInternal(ver: Veranstaltung): string {
    // für interne Mails
    return `### [${ver.kopf.titelMitPrefix}](${prefix}${ver.fullyQualifiedUrl}?page=presse)
#### ${ver.startDatumUhrzeit.fuerPresse} ${ver.kopf.presseInEcht}

`;
  }

  const markdownToSend = `## Folgende Veranstaltungen oder Vermietungen haben noch keinen Pressetext und werden im Laufe der nächsten Woche der Presse angekündigt:

---
${map(kaputte, (veranst) => presseTemplateInternal(veranst)).join("\n\n---\n")}`;
  const message = new MailMessage({
    subject: "Veranstaltungen ohne Pressetext",
  });
  message.body = markdownToSend;
  const bookingAddresses = usersService.emailsAllerBookingUser();
  logger.debug(`Email Adressen für fehlende Pressetexte: ${formatMailAddresses(bookingAddresses)}`);
  message.bcc = bookingAddresses;
  return mailtransport.sendMail(message);
}

async function processRules(rules: MailRule[], start: DatumUhrzeit, end: DatumUhrzeit) {
  const maxDay = map(rules, (rule) => rule.startAndEndDay(end).end).reduce((day1, day2) => (day1.istNach(day2) ? day1 : day2), end);

  function filterFunc(ver: Veranstaltung) {
    return !ver.presse.checked && ver.kopf.confirmed && ver.brauchtPresse;
  }

  const kaputteZuSendende = byDateRangeInAscendingOrder({
    from: start,
    to: maxDay,
    konzerteFilter: filterFunc,
    vermietungenFilter: filterFunc,
  });
  if (kaputteZuSendende.length) {
    return sendMail(kaputteZuSendende);
  }
}

export async function checkPressetexte(now: DatumUhrzeit): Promise<JobResult> {
  const start = now;
  const end = start.plus({ tage: 1 }); // Eine Woche im Voraus

  try {
    const rules = mailstore.all();
    const relevantRules = filter(rules, (rule) => rule.shouldSendUntil(start, end));
    return { result: await processRules(relevantRules, start, end) };
  } catch (error) {
    return { error: error as Error };
  }
}
