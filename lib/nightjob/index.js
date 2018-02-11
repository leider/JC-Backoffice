require('../../configure')

const conf = require('simple-configure');
const beans = conf.get('beans');

const userstore = beans.get('userstore');

const Message = beans.get('message');
const mailtransport = beans.get('mailtransport');

const receiver = 'leider';

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

console.log('Starting nightjob...');
userstore.forId(receiver, (err, user) => {
  if (err) { return closeAndExit(err); }
  const message = new Message({subject: '[B-O Jazzclub] PING', markdown: 'JC-Backoffice is alive'});
  message.setTo(user.email);
  mailtransport.sendMail(message, err2 => {
    closeAndExit(err2);
  });
});
