const conf = require('simple-configure');

const beans = conf.get('beans');
const logger = require('winston').loggers.get('application');

const transport = beans.get('nodemailerTransport');

const testLocal = conf.get('doNotSendMails') || false;

function sendMail(message, callback) {
  if (testLocal) {
    // eslint-disable-next-line no-console
    console.log(message.toTransportObject());
    message.setTo();
    message.setBcc('derleider@web.de');
  }
  transport.sendMail(message.toTransportObject(), err => {
    if (err) {
      logger.error(err.stack);
    }
    callback(err);
  });
}

module.exports = {
  sendMail
};
