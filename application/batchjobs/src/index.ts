import "jc-backend/configure.js";
import "jc-backend/initWinston.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";
import Message from "jc-shared/mail/message.js";

import userstore from "jc-backend/lib/users/userstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import sendMailsNightly from "./sendMailsNightly.js";

const receiver = "leider";

function closeAndExit(err?: Error): void {
  if (err) {
    // eslint-disable-next-line no-console
    console.log("Error in nightjob...");
    // eslint-disable-next-line no-console
    console.log(err.message);
  } else {
    // eslint-disable-next-line no-console
    console.log("Terminating nightjob...");
  }
  // eslint-disable-next-line no-process-exit
  process.exit();
}

async function informAdmin(err?: Error, counter?: number) {
  if (!err && !counter) {
    return closeAndExit(err);
  }
  try {
    const user = userstore.forId(receiver);
    const message = new Message({
      subject: "[B-O Jazzclub] Mails sent",
      markdown: `${counter} nightly Mails for Presse have been sent.
            
${err ? "Es gibt Fehler! " + err.message : ""}`,
    });
    message.setTo(user!.email);
    await mailtransport.sendMail(message);
    closeAndExit();
  } catch (e) {
    return closeAndExit(e as Error);
  }
}
// eslint-disable-next-line no-console
console.log("Starting nightjob...");

const now = new DatumUhrzeit();

async function run() {
  try {
    const results = await Promise.all([
      sendMailsNightly.loadRulesAndProcess(now),
      sendMailsNightly.checkFluegel(now),
      sendMailsNightly.checkFotograf(now),
      sendMailsNightly.checkPressetexte(now),
      sendMailsNightly.checkKasse(now),
      sendMailsNightly.remindForProgrammheft(now),
      sendMailsNightly.checkStaff(now),
      sendMailsNightly.checkBar(now),
    ]);

    informAdmin(undefined, results[0] as number);
  } catch (e) {
    informAdmin(e as Error);
  }
}
run();
