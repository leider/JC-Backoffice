const sendMailsInternalInformation = require('./sendMailsInternalInformation');

module.exports = {
  loadRulesAndProcess: require('./sendMailsForRules').loadRulesAndProcess,
  checkPressetexte: sendMailsInternalInformation.checkPressetexte,
  checkKasse: sendMailsInternalInformation.checkKasse,
  checkFluegel: sendMailsInternalInformation.checkFluegel,
  remindForProgrammheft: require('./sendMailsForProgrammheft')
    .remindForProgrammheft
};
