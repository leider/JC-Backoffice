import { checkPressetexte } from "./sendMailsPressetextFehlt.js";
import { checkKasse } from "./sendMailsKasseFehlt.js";
import { checkFluegel, checkFotograf } from "./sendMailsNightlyPhotoAndFluegel.js";
import { loadRulesAndProcess } from "./sendMailsForRules.js";
import { remindForProgrammheft } from "./sendMailsForProgrammheft.js";
import { checkStaff } from "./sendMailsStaffReminder.js";

export default {
  loadRulesAndProcess,
  checkPressetexte,
  checkKasse,
  checkFluegel,
  checkFotograf,
  remindForProgrammheft,
  checkStaff,
};
