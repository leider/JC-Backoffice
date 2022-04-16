import "jc-backend/configure";
import "jc-backend/initWinston";

import async from "async";
import partial from "lodash/partial";

import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Message from "jc-shared/mail/message";
import User from "jc-shared/user/user";

import userstore from "jc-backend/lib/users/userstore";
import mailtransport from "jc-backend/lib/mailsender/mailtransport";

const receiver = "leider";
import sendMailsNightly from "./sendMailsNightly";

function closeAndExit(err: Error | undefined): void {
  if (err) {
    console.log("Error in nightjob...");
    console.log(err.message);
  } else {
    console.log("Terminating nightjob...");
  }
  // eslint-disable-next-line no-process-exit
  process.exit();
}

function informAdmin(err: Error | undefined, counter?: number): void {
  if (!err && !counter) {
    return closeAndExit(err);
  }
  return userstore.forId(receiver, (err1: Error | null, user: User) => {
    if (err1) {
      return closeAndExit(err1);
    }
    const message = new Message({
      subject: "[B-O Jazzclub] Mails sent",
      markdown: `Nightly Mails have been sent
Anzahl: ${counter}
Error: ${err ? err.message : "keiner"}`,
    });
    message.setTo(user.email);
    return mailtransport.sendMail(message, (err2: Error | undefined) => {
      closeAndExit(err2);
    });
  });
}

console.log("Starting nightjob...");

const now = new DatumUhrzeit();

async.parallel(
  {
    checkFluegel: partial(sendMailsNightly.checkFluegel, now),
    checkFotograf: partial(sendMailsNightly.checkFotograf, now),
    checkPresse: partial(sendMailsNightly.checkPressetexte, now),
    checkKasse: partial(sendMailsNightly.checkKasse, now),
    send: partial(sendMailsNightly.loadRulesAndProcess, now),
    remindForProgrammheft: partial(sendMailsNightly.remindForProgrammheft, now),
    checkStaff: partial(sendMailsNightly.checkStaff, now),
  },
  (err: Error | undefined, results) => {
    informAdmin(err, results.send as number);
  }
);
