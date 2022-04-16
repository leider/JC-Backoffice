import { checkPressetexte } from "./sendMailsPressetextFehlt";
import { checkKasse } from "./sendMailsKasseFehlt";
import { checkFluegel, checkFotograf } from "./sendMailsNightlyPhotoAndFluegel";
import { loadRulesAndProcess } from "./sendMailsForRules";
import { remindForProgrammheft } from "./sendMailsForProgrammheft";
import { checkStaff } from "./sendMailsStaffReminder";

export default {
  loadRulesAndProcess,
  checkPressetexte,
  checkKasse,
  checkFluegel,
  checkFotograf,
  remindForProgrammheft,
  checkStaff,
};
