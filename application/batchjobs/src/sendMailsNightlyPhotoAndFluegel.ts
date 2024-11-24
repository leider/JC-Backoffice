import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import conf from "jc-shared/commons/simpleConfigure.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import usersService from "jc-backend/lib/users/usersService.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import formatMailAddresses from "jc-shared/mail/formatMailAddresses.js";
import { JobResult } from "./sendMailsNightly.js";

const logger = loggers.get("application");

type SendMailVariables = { name: string; email: string; subject: string; firstLine: string };

async function sendMail(stuffToSend: Veranstaltung[], variables: SendMailVariables) {
  const markdownToSend = `${variables.firstLine}

---
${stuffToSend
  .map((veranst) => veranst.kopf.titelMitPrefix + " am " + veranst.datumForDisplayShort + " " + veranst.kopf.presseInEcht)
  .join("\n\n---\n")}`;

  const message = new MailMessage({
    subject: variables.subject,
  });
  message.body = markdownToSend;

  const adminAddresses = usersService.emailsAllerAdmins();
  logger.info(`Email Adressen für ${variables.subject}: ${formatMailAddresses(adminAddresses)}`);
  message.to = [MailMessage.formatEMailAddress(variables.name, variables.email)];
  message.bcc = adminAddresses;
  return mailtransport.sendMail(message);
}

async function checkForFilter(
  filterFunction: (ver: Veranstaltung) => boolean,
  variables: SendMailVariables,
  now: DatumUhrzeit,
): Promise<JobResult> {
  if (now.wochentag !== 0) {
    // Sonntag
    return {};
  }
  if (!variables.name || !variables.email) {
    return {};
  }
  const start = now;
  const end = start.plus({ wochen: 6 }); // Sechs Wochen im Voraus

  const zuSendende = byDateRangeInAscendingOrder({
    from: start,
    to: end,
    konzerteFilter: filterFunction,
    vermietungenFilter: filterFunction,
  });
  if (zuSendende.length === 0) {
    return {};
  }
  try {
    return { result: await sendMail(zuSendende, variables) };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function checkFotograf(now: DatumUhrzeit) {
  const variables = {
    name: conf.fotografName,
    email: conf.fotografEmail,
    subject: "Photographing for Jazzclub",
    firstLine: "## The following concerts may profit from a professional photographer:",
  };
  return checkForFilter(
    (ver: Veranstaltung) => {
      const satisfied = ver.kopf.fotografBestellen && ver.kopf.confirmed;
      if (ver.isVermietung) {
        return (ver as Vermietung).brauchtPresse && satisfied;
      }
      return satisfied;
    },
    variables,
    now,
  );
}

export async function checkFluegel(now: DatumUhrzeit) {
  const variables = {
    name: conf.stimmerName,
    email: conf.stimmerEmail,
    subject: "Flügelstimmen im Jazzclub",
    firstLine: "## Bei folgenden Veranstaltungen brauchen wir einen Klavierstimmer:",
  };
  return checkForFilter(
    (ver: Veranstaltung) => {
      const satisfied = ver.technik.fluegel && ver.kopf.confirmed;
      if (ver.isVermietung) {
        return (ver as Vermietung).brauchtTechnik && satisfied;
      }
      return satisfied;
    },
    variables,
    now,
  );
}
