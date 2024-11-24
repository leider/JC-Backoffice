/* eslint-disable no-console */

import userstore from "jc-backend/lib/users/userstore.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import { JobResult } from "./sendMailsNightly.js";
import compact from "lodash/compact.js";

const receiver = "leider";

export type JobType = "Programmheft" | "Presse" | "Kasse" | "Bar" | "Photo" | "Fluegel" | "TextFehlt" | "Staff";

export async function informAdmin({ type, each }: { type: JobType; each: JobResult }) {
  const infosCompacted = Array.isArray(each.result) ? compact(each.result) : compact([each.result]);

  if (each === undefined || (!infosCompacted.length && !each.error)) {
    console.log(`nothing happened for JobType "${type}"`);
    return;
  }
  const user = userstore.forId(receiver);
  if (!user) {
    console.error("User not found");
    return;
  }
  user.email = "nadreas.leidig@jazzclub.de";

  if (each.error) {
    console.error(`error occurred while informing ${each.error}`);
  }

  const infos = infosCompacted.map(({ accepted, rejected, response, envelope }) => ({
    accepted,
    rejected,
    response,
    envelope,
  }));
  const count = infos.length;

  const message = new MailMessage({
    subject: `[${each.error ? "ERROR" : "INFO"} B-O Jazzclub] Mails sent for jobtype "${type}"`,
  });
  message.to = [{ name: user.name, address: user.email }];
  message.body = `${count} nightly Mails for jobtype "${type}" have been sent.
            
${
  each.error
    ? `Es gibt Fehler! ${each.error.message}

${each.error}`
    : `Informationen zu den gesendeten E-Mails: 
    ${"\n```\n" + JSON.stringify(infos, null, 2) + "\n```"}`
}`;
  return mailtransport.sendMail(message);
}
