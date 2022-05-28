import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Message from "jc-shared/mail/message";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import User from "jc-shared/user/user";

import config from "jc-backend/lib/commons/simpleConfigure";

import store from "jc-backend/lib/veranstaltungen/veranstaltungenstore";
import userstore from "jc-backend/lib/users/userstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";
import async from "async";
import mixVeranstaltungenMitUsers, { VerMitUser } from "jc-shared/commons/mixVeranstaltungenMitUsers";

function toFullQualifiedUrl(prefix: string, localUrl: string): string {
  function trimLeadingAndTrailingSlash(string: string): string {
    return string.replace(/(^\/)|(\/$)/g, "");
  }

  return config.get("publicUrlPrefix") + "/vue/" + trimLeadingAndTrailingSlash(prefix) + "/" + trimLeadingAndTrailingSlash(localUrl);
}

function sendMail(verMitUser: VerMitUser, callback: Function): void {
  const veranstaltung = verMitUser.veranstaltung;
  const user = verMitUser.user;

  const markdownToSend = `## Hallo ${user.name}! Bei folgender Veranstaltung bist Du im Staff eingetragen!:

<a href="${toFullQualifiedUrl("veranstaltungen", encodeURIComponent(veranstaltung.url || ""))}">${veranstaltung.kopf.titelMitPrefix} am ${
    veranstaltung.datumForDisplayShort
  } ${veranstaltung.kopf.presseInEcht}</a>

--- 
<a href="${toFullQualifiedUrl("teamseite", "")}">Zur Teamseite</a>`;

  const message = new Message({
    subject: "[JAZZCLUB REMINDER] Du hast Dich zum Arbeiten eingetragen!",
    markdown: markdownToSend,
  });
  message.setTo(user.email);
  return mailtransport.sendMail(message, callback);
}

export function checkStaff(now: DatumUhrzeit, callback: Function): void {
  const start = now;
  const end = start.plus({ tage: 1 }); // Ein Tag im Voraus

  store.byDateRangeInAscendingOrder(start, end, (err: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err) {
      return callback();
    }
    userstore.allUsers((err: Error | null, users: User[]) => {
      if (err) {
        return callback(err);
      }
      const validUsers = users.filter((user) => !!user.email && !!user.wantsEmailReminders);
      const zuSendende = veranstaltungen;
      if (zuSendende.length === 0) {
        callback();
      } else {
        const verMitUsers = mixVeranstaltungenMitUsers(zuSendende, validUsers);
        async.each(verMitUsers, sendMail, (err) => {
          if (err) {
            callback(err);
          }
          callback();
        });
      }
    });
  });
}
