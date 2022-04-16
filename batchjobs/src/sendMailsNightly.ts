import { checkPressetexte } from "./sendMailsPressetextFehlt";
import { checkKasse } from "./sendMailsKasseFehlt";
import { checkFluegel, checkFotograf } from "./sendMailsNightlyPhotoAndFluegel";
import { loadRulesAndProcess } from "./sendMailsForRules";
import { remindForProgrammheft } from "./sendMailsForProgrammheft";

export default {
  loadRulesAndProcess,
  checkPressetexte,
  checkKasse,
  checkFluegel,
  checkFotograf,
  remindForProgrammheft,
};
