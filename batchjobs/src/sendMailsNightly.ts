import { checkPressetexte, checkFluegel, checkKasse, checkFotograf } from "./sendMailsInternalInformation";
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
