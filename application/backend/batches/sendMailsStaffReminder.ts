import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import conf from "../simpleConfigure.js";
import userstore from "../lib/users/userstore.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import mixVeranstaltungenMitUsers, { VerMitUser } from "jc-shared/commons/mixVeranstaltungenMitUsers.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import { JobResult } from "./index.js";
import map from "lodash/map.js";
import filter from "lodash/filter.js";

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

  const message = new MailMessage({
    subject: "[JAZZCLUB REMINDER] Du hast Dich zum Arbeiten eingetragen!",
  });
  message.body = markdownToSend;
  message.to = [MailMessage.formatEMailAddress(user.name, user.email)];
  return mailtransport.sendMail(message);
}

export async function checkStaff(now: DatumUhrzeit): Promise<JobResult> {
  const start = now;
  const end = start.plus({ tage: 1 }); // Ein Tag im Voraus

  try {
    const bestaetigt = (ver: Veranstaltung) => ver.kopf.confirmed;
    const alle = byDateRangeInAscendingOrder({
      from: start,
      to: end,
      konzerteFilter: bestaetigt,
      vermietungenFilter: bestaetigt,
    });

    const users = userstore.allUsers();
    const validUsers = filter(users, (user) => !!user.email && !!user.wantsEmailReminders);
    const zuSendende = alle;
    if (zuSendende.length) {
      const verMitUsers = mixVeranstaltungenMitUsers(zuSendende, validUsers);
      return { result: await Promise.all(map(verMitUsers, sendMail)) };
    }
    return {};
  } catch (error) {
    return { error: error as Error };
  }
}
