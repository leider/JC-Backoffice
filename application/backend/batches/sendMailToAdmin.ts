import userstore from "../lib/users/userstore.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import mailtransport from "../lib/mailsender/mailtransport.js";
import { JobResult } from "./index.js";
import compact from "lodash/compact.js";
import map from "lodash/map.js";

const receiver = "leider";

export type JobType = "Programmheft" | "Presse" | "Kasse" | "Bar" | "Photo" | "Fluegel" | "TextFehlt" | "Staff" | "Master";

export async function informAdmin(allResults: { type: JobType; jobResult: JobResult }[]) {
  const user = userstore.forId(receiver);
  if (!user) {
    throw new Error("User not found.");
  }

  const collectedErrors = [];

  function createBodyFragment({ type, jobResult }: { type: JobType; jobResult: JobResult }) {
    const error = jobResult.error;
    const infosCompacted = Array.isArray(jobResult.result) ? compact(jobResult.result) : compact([jobResult.result]);

    if (!infosCompacted.length && !error) {
      return;
    }
    if (error) {
      collectedErrors.push(`error occurred while informing for type: ${type}. ERROR: ${error}`);
    }

    const infos = map(infosCompacted, ({ accepted, rejected, response }) => ({
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

  const bodyFragments = compact(map(allResults, createBodyFragment));
  if (!bodyFragments.length) {
    return;
  }

  const errorHappened = collectedErrors.length > 0;
  const message = new MailMessage({
    subject: `[${errorHappened ? "ERROR" : "INFO"} B-O Jazzclub] Mails sent`,
  });
  message.to = [{ name: user.name, address: user.email }];
  message.body = bodyFragments.join("\n");
  return mailtransport.sendMail(message);
}
