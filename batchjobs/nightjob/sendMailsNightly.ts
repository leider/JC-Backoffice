import { checkPressetexte, checkFluegel, checkKasse } from "./sendMailsInternalInformation";
import { loadRulesAndProcess } from "./sendMailsForRules";
import { remindForProgrammheft } from "./sendMailsForProgrammheft";

export default {
  loadRulesAndProcess,
  checkPressetexte,
  checkKasse,
  checkFluegel,
  remindForProgrammheft
};
