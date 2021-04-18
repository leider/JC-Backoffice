import { loggers } from "winston";
const logger = loggers.get("application");

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Message from "jc-shared/mail/message";
import MailRule from "jc-shared/mail/mailRule";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import User from "jc-shared/user/user";

import config from "jc-backend/lib/commons/simpleConfigure";

import store from "jc-backend/lib/veranstaltungen/veranstaltungenstore";
import userstore from "jc-backend/lib/users/userstore";
import mailstore from "jc-backend/lib/mailsender/mailstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";
import conf from "jc-backend/lib/commons/simpleConfigure";
import usersService from "jc-backend/lib/users/usersService";

function toFullQualifiedUrl(prefix: string, localUrl: string): string {
  function trimLeadingAndTrailingSlash(string: string): string {
    return string.replace(/(^\/)|(\/$)/g, "");
  }

  return conf.get("publicUrlPrefix") + "/" + trimLeadingAndTrailingSlash(prefix) + "/" + trimLeadingAndTrailingSlash(localUrl);
}

export function checkPressetexte(now: DatumUhrzeit, callbackOuter: Function): void {
  const start = now;
  const end = start.plus({ tage: 1 }); // Eine Woche im Voraus

  function processRules(rules: MailRule[], callback: Function): void {
    const maxDay = rules.map((rule) => rule.startAndEndDay(end).end).reduce((day1, day2) => (day1.istNach(day2) ? day1 : day2), end);

    function sendMail(kaputteVeranstaltungen: Veranstaltung[], callbackInner: Function): void {
      const prefix = conf.get("publicUrlPrefix") as string;
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
      usersService.emailsAllerBookingUser((err: Error | null, bookingAddresses: string) => {
        logger.info(`Email Adressen für fehlende Pressetexte: ${bookingAddresses}`);
        message.setBcc(bookingAddresses);
        mailtransport.sendMail(message, callbackInner);
      });
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

  mailstore.all((err: Error | null, rules: MailRule[]) => {
    if (err) {
      return;
    }
    const relevantRules = rules.filter((rule) => rule.shouldSendUntil(start, end));
    processRules(relevantRules, callbackOuter);
  });
}

function kasseFehlt(veranstaltung: Veranstaltung): boolean {
  return veranstaltung.staff.kasseFehlt && veranstaltung.kopf.confirmed;
}

export function checkKasse(now: DatumUhrzeit, callback: Function): void {
  const start = now;
  const end = start.plus({ tage: 7 }); // Eine Woche im Voraus

  function sendMail(kaputteVeranstaltungen: Veranstaltung[], callbackInner: Function): void {
    const markdownToSend = `## Bei folgenden Veranstaltungen der nächsten 8 Tage fehlt noch jemand an der Kasse:

---
${kaputteVeranstaltungen
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

    userstore.allUsers((err: Error | null, users: User[]) => {
      if (err) {
        return callback(err);
      }
      const validUsers = users.filter((user) => !!user.email);
      const emails = validUsers.map((user) => Message.formatEMailAddress(user.name, user.email));
      logger.info(`Email Adressen für fehlende Kasse: ${emails}`);
      message.setBcc(emails);
      return mailtransport.sendMail(message, callbackInner);
    });
  }

  store.byDateRangeInAscendingOrder(start, end, (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err1) {
      return;
    }
    const zuSendende = veranstaltungen.filter((veranstaltung) => kasseFehlt(veranstaltung));
    if (zuSendende.length === 0) {
      callback();
    } else {
      sendMail(zuSendende, callback);
    }
  });
}

export function checkFluegel(now: DatumUhrzeit, callback: Function): void {
  if (now.wochentag !== 7) {
    // Sonntag
    return callback();
  }
  const stimmerName = config.get("stimmer-name");
  const stimmerEmail = config.get("stimmer-email");
  if (!stimmerName || !stimmerEmail) {
    return callback();
  }
  const start = now;
  const end = start.plus({ wochen: 6 }); // Sechs Wochen im Voraus

  function sendMail(veranstaltungenMitFluegel: Veranstaltung[], callbackInner: Function): void {
    const markdownToSend = `## Bei folgenden Veranstaltungen brauchen wir einen Klavierstimmer:

---
${veranstaltungenMitFluegel
  .map((veranst) => veranst.kopf.titelMitPrefix + " am " + veranst.datumForDisplayShort + " " + veranst.kopf.presseInEcht)
  .join("\n\n---\n")}`;

    const message = new Message({
      subject: "Flügelstimmen im Jazzclub",
      markdown: markdownToSend,
    });

    return usersService.emailsAllerBookingUser((err: Error | null, bookingAddresses: string[]) => {
      if (err) {
        return callback(err);
      }
      logger.info(`Email Adressen für Flügelstimmen: ${bookingAddresses}`);
      message.setTo([Message.formatEMailAddress(stimmerName as string, stimmerEmail as string)]);
      message.setBcc(bookingAddresses);
      return mailtransport.sendMail(message, callbackInner);
    });
  }

  return store.byDateRangeInAscendingOrder(start, end, (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err1) {
      return;
    }
    const zuSendende = veranstaltungen.filter((veranstaltung) => veranstaltung.technik.fluegel);
    if (zuSendende.length === 0) {
      callback();
    } else {
      sendMail(zuSendende, callback);
    }
  });
}
