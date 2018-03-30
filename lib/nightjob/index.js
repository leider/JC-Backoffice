require('../../configure');

const conf = require('simple-configure');
const beans = conf.get('beans');

const async = require('async');

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
      markdown: 'Nightly Mails have been sent' + '\nAnzahl: ' + counter + '\nError: ' + (err ? err.message : 'keiner')
    });
    message.setTo(user.email);
    mailtransport.sendMail(message, err2 => {
      closeAndExit(err2);
    });
  });
}

console.log('Starting nightjob...');

async.parallel({
    checkPresse: sendMailsNightly.checkPressetexte,
    checkKasse: sendMailsNightly.checkKasse,
    send: sendMailsNightly.loadRulesAndProcess
  }, (err, results) => {
    informAdmin(err, results.send);
  }
);
