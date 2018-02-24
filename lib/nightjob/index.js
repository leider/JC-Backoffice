require('../../configure');

const conf = require('simple-configure');
const beans = conf.get('beans');

const userstore = beans.get('userstore');

const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');

const receiver = 'leider';

const sendMailsNightly = require('../mailsender/sendMailsNightly');

/* eslint no-console: 0 */
function closeAndExit(err, exit) {
  /* eslint no-process-exit: 0 */
  if (err) {
    console.log('Error in nightjob...');
    console.log(err.message);
  } else {
    console.log('Terminating nightjob...');
  }
  if (exit) {
    process.exit();
  }
}

function informAdmin(err, counter, exit) {
  if (!exit && !err) {
    return;
  }
  if (!err && !counter && exit) {
    return closeAndExit(err, exit);
  }
  userstore.forId(receiver, (err1, user) => {
    if (err1) { return closeAndExit(err1, exit); }
    const message = new Message({
      subject: '[B-O Jazzclub] Mails sent',
      markdown: 'Nightly Mails have been sent' + '\nAnzahl: ' + counter + '\nError: ' + (err ? err.message : 'keiner')
    });
    message.setTo(user.email);
    mailtransport.sendMail(message, err2 => {
      closeAndExit(err2, exit);
    });
  });
}

console.log('Starting nightjob...');
sendMailsNightly.checkVeranstaltungen(err => {
  informAdmin(err, false);
  sendMailsNightly.loadRulesAndProcess((err1, counter) => {
    informAdmin(err1, counter, true);
  });
});
