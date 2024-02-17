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

export async function checkBar(now: DatumUhrzeit) {
  const name = config.get("bar-name") as string;
  const email = config.get("bar-email") as string;
  const subject = "Jazzclub Bar Termine";
  const firstLine = "## An folgenden Terminen haben wir Veranstaltungen im Jazzclub:";

  if (now.wochentag !== 0) {
    // Sonntag
    return;
  }
  if (!name || !email) {
    return;
  }
  const start = now;
  const end = start.plus({ wochen: 8 }); // Acht Wochen im Voraus
  const filterFunction = (ver: Konzert | Vermietung) => {
    const typOk = !ver.isVermietung ? !ver.kopf.eventTyp.startsWith("DryJam") : true;
    return ver.kopf.ort === "Jazzclub" && ver.kopf.confirmed && typOk;
  };
  const zuSendende = await byDateRangeInAscendingOrder({
    from: start,
    to: end,
    konzerteFilter: filterFunction,
    vermietungenFilter: filterFunction,
  });
  if (zuSendende.length === 0) {
    return;
  }

  const markdownToSend = `${firstLine}

---
${zuSendende
  .map((konzert) => `${konzert.datumForDisplayShort} bis ${konzert.endDatumUhrzeit.format("LT")} - ${konzert.kopf.titelMitPrefix}`)
  .join("\n\n---\n")}`;

  const message = new Message({
    subject: subject,
    markdown: markdownToSend,
  });

  const adminAddresses = await usersService.emailsAllerAdmins();
  logger.info(`Email Adressen für ${subject}: ${adminAddresses}`);
  message.setTo([Message.formatEMailAddress(name, email)]);
  message.setBcc(adminAddresses);
  return mailtransport.sendMail(message);
}
