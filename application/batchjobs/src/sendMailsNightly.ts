import { checkPressetexte } from "./sendMailsPressetextFehlt.js";
import { checkKasse } from "./sendMailsKasseFehlt.js";
import { checkFluegel, checkFotograf } from "./sendMailsNightlyPhotoAndFluegel.js";
import { loadRulesAndProcess } from "./sendMailsForRules.js";
import { remindForProgrammheft } from "./sendMailsForProgrammheft.js";
import { checkStaff } from "./sendMailsStaffReminder.js";
import { checkBar } from "./sendMailsNightlyBar.js";
import * as SMTPTransport from "nodemailer/lib/smtp-transport/index.js";

export type JobResult = { result?: (SMTPTransport.SentMessageInfo | undefined)[] | SMTPTransport.SentMessageInfo; error?: Error };

export default {
  loadRulesAndProcess,
  checkPressetexte,
  checkKasse,
  checkFluegel,
  checkFotograf,
  remindForProgrammheft,
  checkStaff,
  checkBar,
};
