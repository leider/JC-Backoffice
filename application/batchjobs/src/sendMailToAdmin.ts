/* eslint-disable no-console */

import userstore from "jc-backend/lib/users/userstore.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import { JobResult } from "./sendMailsNightly.js";
import compact from "lodash/compact.js";

const receiver = "leider";

export type JobType = "Programmheft" | "Presse" | "Kasse" | "Bar" | "Photo" | "Fluegel" | "TextFehlt" | "Staff";

export async function informAdmin(allResults: { type: JobType; jobResult: JobResult }[]) {
  const user = userstore.forId(receiver);
  if (!user) {
    console.error("User not found");
    return;
  }

  let errorHappened = false;

  function createBodyFragment({ type, jobResult }: { type: JobType; jobResult: JobResult }) {
    const error = jobResult.error;
    const infosCompacted = Array.isArray(jobResult.result) ? compact(jobResult.result) : compact([jobResult.result]);

    if (!infosCompacted.length && !error) {
      console.log(`nothing happened for JobType "${type}"`);
      return;
    }
    if (error) {
      errorHappened = true;
      console.error(`error occurred while informing for type: ${type}. ERROR: ${error}`);
    }

    const infos = infosCompacted.map(({ accepted, rejected, response }) => ({
      accepted,
      rejected,
      response,
    }));
    const count = infos.length;

    return `**${type}** ${count} Mail(s)
            
${
  error
    ? `### Es gibt Fehler!
${error}`
    : `${"\n```\n" + JSON.stringify(infos, null, 2) + "\n```"}`
}`;
  } // end function createBodyFragment

  const bodyFragments = compact(allResults.map(createBodyFragment));
  if (!bodyFragments.length) {
    return;
  }

  const message = new MailMessage({
    subject: `[${errorHappened ? "ERROR" : "INFO"} B-O Jazzclub] Mails sent`,
  });
  message.to = [{ name: user.name, address: user.email }];
  message.body = bodyFragments.join("\n");
  return mailtransport.sendMail(message);
}
