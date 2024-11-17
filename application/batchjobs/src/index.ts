import "jc-backend/configure.js";
import "jc-backend/initWinston.js";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.js";

import userstore from "jc-backend/lib/users/userstore.js";
import mailtransport from "jc-backend/lib/mailsender/mailtransport.js";
import sendMailsNightly from "./sendMailsNightly.js";
import MailMessage from "jc-shared/mail/mailMessage.js";
import User from "jc-shared/user/user.js";

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
    const user = userstore.forId(receiver) as User;
    const message = new MailMessage({
      subject: "[B-O Jazzclub] Mails sent",
    });
    message.body = `${counter} nightly Mails for Presse have been sent.
            
${err ? "Es gibt Fehler! " + err.message + "\n\n" + err : ""}`;
    message.to = [{ name: user.name, address: user.email }];
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
