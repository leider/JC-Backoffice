import { loggers } from "winston";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import conf from "../simpleConfigure.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import usersService from "../lib/users/usersService.js";
import { byDateRangeInAscendingOrder } from "./gigAndRentService.js";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.js";
import Vermietung from "jc-shared/vermietung/vermietung.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import formatMailAddresses from "jc-shared/mail/formatMailAddresses.js";
import { JobResult } from "./index.js";
import Konzert from "jc-shared/konzert/konzert.js";
import map from "lodash/map.js";

const logger = loggers.get("application");

export async function checkBar(now: DatumUhrzeit): Promise<JobResult> {
  function formatVeranstaltung(veranstaltung: Veranstaltung) {
    function textFuerBesucher() {
      const erwartete = !veranstaltung.isVermietung && (veranstaltung as Konzert).eintrittspreise.erwarteteBesucher;
      return erwartete ? "(Wir erwarten " + erwartete + " Besucher)" : "";
    }
    return `${veranstaltung.datumForDisplayShort} bis ${veranstaltung.endDatumUhrzeit.format("LT")} - ${veranstaltung.kopf.titelMitPrefix} ${textFuerBesucher()}`;
  }

  try {
    const name = conf.barName;
    const email = conf.barEmail;
    const subject = "Jazzclub Bar Termine";
    const firstLine = "## An folgenden Terminen haben wir Veranstaltungen im Jazzclub:";

    if (now.wochentag !== 0) {
      // Sonntag
      return {};
    }
    if (!name || !email) {
      return {};
    }
    const start = now;
    const end = start.plus({ wochen: 8 }); // Acht Wochen im Voraus
    const filterFunction = (ver: Veranstaltung) => {
      const typOk = !ver.isVermietung ? !ver.kopf.eventTyp.startsWith("DryJam") : (ver as Vermietung).brauchtBar;
      return ver.kopf.ort.includes("Jazzclub") && ver.kopf.confirmed && typOk;
    };
    const zuSendende = byDateRangeInAscendingOrder({
      from: start,
      to: end,
      konzerteFilter: filterFunction,
      vermietungenFilter: filterFunction,
    });
    if (zuSendende.length === 0) {
      return {};
    }

    const markdownToSend = `${firstLine}

---
${map(zuSendende, formatVeranstaltung).join("\n\n---\n")}`;

    const message = new MailMessage({
      subject: subject,
    });
    message.body = markdownToSend;

    const adminAddresses = usersService.emailsAllerAdmins();
    logger.debug(`Email Adressen für ${subject}: ${formatMailAddresses(adminAddresses)}`);
    message.to = MailMessage.formatEMailAddressCommaSeparated(name, email);
    message.bcc = adminAddresses;
    return { result: await mailtransport.sendMail(message) };
  } catch (error) {
    return { error: error as Error };
  }
}
