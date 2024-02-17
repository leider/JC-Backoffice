import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Message from "jc-shared/mail/message.js";
import Konzert from "jc-shared/konzert/konzert.js";

import config from "jc-shared/commons/simpleConfigure.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import usersService from "jc-backend/lib/users/usersService.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";

const logger = loggers.get("application");

type SendMailVariables = { name: string; email: string; subject: string; firstLine: string };

async function sendMail(stuffToSend: (Konzert | Vermietung)[], variables: SendMailVariables) {
  const markdownToSend = `${variables.firstLine}

---
${stuffToSend
  .map((veranst) => veranst.kopf.titelMitPrefix + " am " + veranst.datumForDisplayShort + " " + veranst.kopf.presseInEcht)
  .join("\n\n---\n")}`;

  const message = new Message({
    subject: variables.subject,
    markdown: markdownToSend,
  });

  const adminAddresses = await usersService.emailsAllerAdmins();
  logger.info(`Email Adressen für ${variables.subject}: ${adminAddresses}`);
  message.setTo([Message.formatEMailAddress(variables.name, variables.email)]);
  message.setBcc(adminAddresses);
  return mailtransport.sendMail(message);
}

async function checkForFilter(
  // eslint-disable-next-line no-unused-vars
  filterFunction: (ver: Konzert | Vermietung) => boolean,
  variables: SendMailVariables,
  now: DatumUhrzeit,
) {
  if (now.wochentag !== 0) {
    // Sonntag
    return;
  }
  if (!variables.name || !variables.email) {
    return;
  }
  const start = now;
  const end = start.plus({ wochen: 6 }); // Sechs Wochen im Voraus

  const zuSendende = await byDateRangeInAscendingOrder({
    from: start,
    to: end,
    konzerteFilter: filterFunction,
    vermietungenFilter: filterFunction,
  });
  if (zuSendende.length === 0) {
    return;
  } else {
    return sendMail(zuSendende, variables);
  }
}

export async function checkFotograf(now: DatumUhrzeit) {
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
  return checkForFilter(
    (ver: Konzert | Vermietung) => {
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
  return checkForFilter(
    (ver: Konzert | Vermietung) => {
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
