import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Message from "jc-shared/mail/message.js";

import conf from "jc-shared/commons/simpleConfigure.js";
import userstore from "jc-backend/lib/users/userstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import mixVeranstaltungenMitUsers, { VerMitUser } from "jc-shared/commons/mixVeranstaltungenMitUsers.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";

function toFullQualifiedUrl(prefix: string, localUrl: string): string {
  function trimLeadingAndTrailingSlash(string: string): string {
    return string.replace(/(^\/)|(\/$)/g, "");
  }

  return conf.publicUrlPrefix + "/vue/" + trimLeadingAndTrailingSlash(prefix) + "/" + trimLeadingAndTrailingSlash(localUrl);
}

async function sendMail(verMitUser: VerMitUser) {
  const prefix = conf.publicUrlPrefix;
  const veranstaltung = verMitUser.veranstaltung;
  const user = verMitUser.user;

  const markdownToSend = `## Hallo ${user.name}! Bei folgender Veranstaltung bist Du im Staff eingetragen!:

[${veranstaltung.kopf.titelMitPrefix} am ${veranstaltung.datumForDisplayShort} ${veranstaltung.kopf.presseInEcht}](${prefix}/vue${
    veranstaltung.fullyQualifiedUrl
  }?page=allgemeines)

--- 
<a href="${toFullQualifiedUrl("team", "")}">Zur Teamseite</a>`;

  const message = new Message({
    subject: "[JAZZCLUB REMINDER] Du hast Dich zum Arbeiten eingetragen!",
    markdown: markdownToSend,
  });
  message.setTo(user.email);
  return mailtransport.sendMail(message);
}

export async function checkStaff(now: DatumUhrzeit) {
  const start = now;
  const end = start.plus({ tage: 1 }); // Ein Tag im Voraus

  const bestaetigt = (ver: Veranstaltung) => ver.kopf.confirmed;
  const alle = byDateRangeInAscendingOrder({
    from: start,
    to: end,
    konzerteFilter: bestaetigt,
    vermietungenFilter: bestaetigt,
  });

  const users = userstore.allUsers();
  const validUsers = users.filter((user) => !!user.email && !!user.wantsEmailReminders);
  const zuSendende = alle;
  if (zuSendende.length === 0) {
    return;
  } else {
    const verMitUsers = mixVeranstaltungenMitUsers(zuSendende, validUsers);
    return Promise.all(verMitUsers.map(sendMail));
  }
}
