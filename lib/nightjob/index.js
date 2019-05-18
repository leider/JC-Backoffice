require('../../configure');
/*eslint no-sync: 0 */
require('../../initWinston');
const async = require('async');
const R = require('ramda');

const conf = require('simple-configure');
const beans = conf.get('beans');
const DatumUhrzeit = beans.get('DatumUhrzeit');

const userstore = beans.get('userstore');

const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');

const receiver = 'leider';

const sendMailsNightly = require('../mailsender/sendMailsNightly');

/* eslint no-console: 0 */
function closeAndExit(err) {
  /* eslint no-process-exit: 0 */
  if (err) {
    console.log('Error in nightjob...');
    console.log(err.message);
  } else {
    console.log('Terminating nightjob...');
  }
  process.exit();
}

function informAdmin(err, counter) {
  if (!err && !counter) {
    return closeAndExit(err);
  }
  userstore.forId(receiver, (err1, user) => {
    if (err1) { return closeAndExit(err1); }
    const message = new Message({
      subject: '[B-O Jazzclub] Mails sent',
      markdown: `Nightly Mails have been sent
Anzahl: ${counter}
Error: ${err ? err.message : 'keiner'}`
    });
    message.setTo(user.email);
    mailtransport.sendMail(message, err2 => {
      closeAndExit(err2);
    });
  });
}

console.log('Starting nightjob...');

const now = new DatumUhrzeit();

async.parallel({
    checkFluegel: R.partial(sendMailsNightly.checkFluegel, [now]),
    checkPresse: R.partial(sendMailsNightly.checkPressetexte, [now]),
    checkKasse: R.partial(sendMailsNightly.checkKasse, [now]),
    send: R.partial(sendMailsNightly.loadRulesAndProcess, [now]),
    remindForProgrammheft: R.partial(sendMailsNightly.remindForProgrammheft, [now]),
  }, (err, results) => {
    informAdmin(err, results.send);
  }
);
