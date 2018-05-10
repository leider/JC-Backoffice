const conf = require('simple-configure');

const beans = conf.get('beans');
const logger = require('winston').loggers.get('application');

// we need to expose the core in order to stub that during automated tests
const transport = beans.get('nodemailerTransport');

function sendMail(message, callback) {
  return callback();
  transport.sendMail(message.toTransportObject(), err => {
    if (err) { logger.error(err.stack); }
    callback(err);
  });
}

module.exports = {
  sendMail
};
