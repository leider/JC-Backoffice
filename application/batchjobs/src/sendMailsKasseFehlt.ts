import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Message from "jc-shared/mail/message.js";
import Konzert from "jc-shared/konzert/konzert.js";

import conf from "jc-shared/commons/simpleConfigure.js";

import store from "jc-backend/lib/konzerte/konzertestore.js";
import userstore from "jc-backend/lib/users/userstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import Users from "jc-shared/user/users.js";
import usersService from "jc-backend/lib/users/usersService.js";

const logger = loggers.get("application");

function toFullQualifiedUrl(prefix: string, localUrl: string): string {
  function trimLeadingAndTrailingSlash(string: string): string {
    return string.replace(/(^\/)|(\/$)/g, "");
  }

  return conf.publicUrlPrefix + "/vue/" + trimLeadingAndTrailingSlash(prefix) + "/" + trimLeadingAndTrailingSlash(localUrl);
}

function kasseFehlt(konzert: Konzert): boolean {
  return konzert.staff.kasseFehlt && konzert.kopf.confirmed;
}

async function sendMail(konzerte: Konzert[]) {
  const markdownToSend = `## Bei folgenden Veranstaltungen der nächsten 8 Tage fehlt noch jemand an der Kasse:

---
${konzerte
  .map(
    (konzert) =>
      `<a href="${toFullQualifiedUrl("veranstaltung", encodeURIComponent(konzert.url || ""))}">` +
      `${konzert.kopf.titelMitPrefix} am ${konzert.datumForDisplayShort} ${konzert.kopf.presseInEcht}</a>`,
  )
  .join("\n\n---\n")}

--- 
<a href="${toFullQualifiedUrl("team", "")}">Zur Teamseite</a>`;

  const message = new Message({
    subject: "Kassenpersonal für Veranstaltungen gesucht",
    markdown: markdownToSend,
  });

  const users = userstore.allUsers();
  const validUsers = new Users(users).getUsersKann("Kasse").filter((user) => !!user.email && user.wantsEmailReminders);
  const adminAddresses = usersService.emailsAllerAdmins();
  const emails = validUsers.map((user) => Message.formatEMailAddress(user.name, user.email)).concat(adminAddresses);
  logger.info(`Email Adressen für fehlende Kasse: ${emails}`);
  message.setBcc(emails);
  return mailtransport.sendMail(message);
}

export async function checkKasse(now: DatumUhrzeit) {
  const start = now;
  const end = start.plus({ tage: 7 }); // Eine Woche im Voraus

  const konzerte = store.byDateRangeInAscendingOrder(start, end);
  const zuSendende = konzerte.filter((konzert) => kasseFehlt(konzert));
  if (zuSendende.length === 0) {
    return;
  } else {
    return sendMail(zuSendende);
  }
}
