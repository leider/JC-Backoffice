import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Message from "jc-shared/mail/message";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

import config from "jc-backend/lib/commons/simpleConfigure";

import store from "jc-backend/lib/veranstaltungen/veranstaltungenstore";
import userstore from "jc-backend/lib/users/userstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";

const logger = loggers.get("application");

function toFullQualifiedUrl(prefix: string, localUrl: string): string {
  function trimLeadingAndTrailingSlash(string: string): string {
    return string.replace(/(^\/)|(\/$)/g, "");
  }

  return config.get("publicUrlPrefix") + "/vue/" + trimLeadingAndTrailingSlash(prefix) + "/" + trimLeadingAndTrailingSlash(localUrl);
}

function kasseFehlt(veranstaltung: Veranstaltung): boolean {
  return veranstaltung.staff.kasseFehlt && veranstaltung.kopf.confirmed;
}

async function sendMail(veranstaltungen: Veranstaltung[]) {
  const markdownToSend = `## Bei folgenden Veranstaltungen der nächsten 8 Tage fehlt noch jemand an der Kasse:

---
${veranstaltungen
  .map(
    (veranst) =>
      `<a href="${toFullQualifiedUrl("veranstaltungen", encodeURIComponent(veranst.url || ""))}">` +
      `${veranst.kopf.titelMitPrefix} am ${veranst.datumForDisplayShort} ${veranst.kopf.presseInEcht}</a>`
  )
  .join("\n\n---\n")}

--- 
<a href="${toFullQualifiedUrl("teamseite", "")}">Zur Teamseite</a>`;

  const message = new Message({
    subject: "Kassenpersonal für Veranstaltungen gesucht",
    markdown: markdownToSend,
  });

  const users = await userstore.allUsers();
  const validUsers = users.filter((user) => !!user.email);
  const emails = validUsers.map((user) => Message.formatEMailAddress(user.name, user.email));
  logger.info(`Email Adressen für fehlende Kasse: ${emails}`);
  message.setBcc(emails);
  return mailtransport.sendMail(message);
}

export async function checkKasse(now: DatumUhrzeit) {
  const start = now;
  const end = start.plus({ tage: 7 }); // Eine Woche im Voraus

  const veranstaltungen = await store.byDateRangeInAscendingOrder(start, end);
  const zuSendende = veranstaltungen.filter((veranstaltung) => kasseFehlt(veranstaltung));
  if (zuSendende.length === 0) {
    return;
  } else {
    return sendMail(zuSendende);
  }
}
