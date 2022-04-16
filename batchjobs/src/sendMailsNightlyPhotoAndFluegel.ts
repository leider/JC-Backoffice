import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Message from "jc-shared/mail/message";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

import config from "jc-backend/lib/commons/simpleConfigure";

import store from "jc-backend/lib/veranstaltungen/veranstaltungenstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";
import usersService from "jc-backend/lib/users/usersService";

const logger = loggers.get("application");

type SendMailVariables = { name: string; email: string; subject: string; firstLine: string };

function sendMail(veranstaltungen: Veranstaltung[], variables: SendMailVariables, callback: Function): void {
  const markdownToSend = `${variables.firstLine}

---
${veranstaltungen
  .map((veranst) => veranst.kopf.titelMitPrefix + " am " + veranst.datumForDisplayShort + " " + veranst.kopf.presseInEcht)
  .join("\n\n---\n")}`;

  const message = new Message({
    subject: variables.subject,
    markdown: markdownToSend,
  });

  return usersService.emailsAllerBookingUser((err: Error | null, bookingAddresses: string[]) => {
    if (err) {
      return callback(err);
    }
    logger.info(`Email Adressen für ${variables.subject}: ${bookingAddresses}`);
    message.setTo([Message.formatEMailAddress(variables.name, variables.email)]);
    message.setBcc(bookingAddresses);
    return mailtransport.sendMail(message, callback);
  });
}

function checkForFilter(
  // eslint-disable-next-line no-unused-vars
  filterFunction: (veranstaltung: Veranstaltung) => boolean,
  variables: SendMailVariables,
  now: DatumUhrzeit,
  callback: Function
) {
  if (now.wochentag !== 0) {
    // Sonntag
    return callback();
  }
  if (!variables.name || !variables.email) {
    return callback();
  }
  const start = now;
  const end = start.plus({ wochen: 6 }); // Sechs Wochen im Voraus

  return store.byDateRangeInAscendingOrder(start, end, (err1: Error | null, veranstaltungen: Veranstaltung[]) => {
    if (err1) {
      return;
    }
    const zuSendende = veranstaltungen.filter(filterFunction);
    if (zuSendende.length === 0) {
      callback();
    } else {
      sendMail(zuSendende, variables, callback);
    }
  });
}

export function checkFotograf(now: DatumUhrzeit, callback: Function): void {
  const name = config.get("fotograf-name") as string;
  const email = config.get("fotograf-email") as string;
  const subject = "Photographing for Jazzclub";
  const firstLine = "## The following concerts may profit from a professional photographer:";

  const variables = {
    name,
    email,
    subject,
    firstLine,
  };
  checkForFilter((veranstaltung: Veranstaltung) => veranstaltung.kopf.fotografBestellen, variables, now, callback);
}

export function checkFluegel(now: DatumUhrzeit, callback: Function): void {
  const name = config.get("stimmer-name") as string;
  const email = config.get("stimmer-email") as string;
  const subject = "Flügelstimmen im Jazzclub";
  const firstLine = "## Bei folgenden Veranstaltungen brauchen wir einen Klavierstimmer:";

  const variables = {
    name,
    email,
    subject,
    firstLine,
  };
  checkForFilter((veranstaltung: Veranstaltung) => veranstaltung.technik.fluegel, variables, now, callback);
}
