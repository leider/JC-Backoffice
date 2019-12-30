import '../../configure';
import '../../initWinston';
import async from 'async';
import R from 'ramda';

import DatumUhrzeit from '../commons/DatumUhrzeit';

import userstore from '../users/userstore';

import Message from '../mailsender/message';
import mailtransport from '../mailsender/mailtransport';
import User from '../users/user';

const receiver = 'leider';
import sendMailsNightly from '../mailsender/sendMailsNightly';

function closeAndExit(err: Error | undefined) {
  if (err) {
    console.log('Error in nightjob...');
    console.log(err.message);
  } else {
    console.log('Terminating nightjob...');
  }
  // eslint-disable-next-line no-process-exit
  process.exit();
}

function informAdmin(err: Error | undefined, counter?: number) {
  if (!err && !counter) {
    return closeAndExit(err);
  }
  userstore.forId(receiver, (err1: Error | null, user: User) => {
    if (err1) {
      return closeAndExit(err1);
    }
    const message = new Message({
      subject: '[B-O Jazzclub] Mails sent',
      markdown: `Nightly Mails have been sent
Anzahl: ${counter}
Error: ${err ? err.message : 'keiner'}`
    });
    message.setTo(user.email);
    mailtransport.sendMail(message, (err2: Error | undefined) => {
      closeAndExit(err2);
    });
  });
}

console.log('Starting nightjob...');

const now = new DatumUhrzeit();

async.parallel(
  {
    checkFluegel: R.partial(sendMailsNightly.checkFluegel, [now]),
    checkPresse: R.partial(sendMailsNightly.checkPressetexte, [now]),
    checkKasse: R.partial(sendMailsNightly.checkKasse, [now]),
    send: R.partial(sendMailsNightly.loadRulesAndProcess, [now]),
    remindForProgrammheft: R.partial(sendMailsNightly.remindForProgrammheft, [
      now
    ])
  },
  (err: Error | undefined, results) => {
    informAdmin(err, results.send as number);
  }
);
