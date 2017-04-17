const R = require('ramda');

const conf = require('simple-configure');

const beans = conf.get('beans');
const logger = require('winston').loggers.get('application');

// we need to expose the core in order to stub that during automated tests
const transport = beans.get('nodemailerTransport');

function sendMail(message, callback) {
  transport.sendMail(message.toTransportObject(), err => {
    if (err) { logger.error(err.stack); }
    callback(err);
  });
}

function sendBulkMail(receiverEmailAddresses, subject, html, fromName, fromAddress, callback) {
  /* eslint consistent-return: 0 */
  if (!receiverEmailAddresses || receiverEmailAddresses.length === 0) {
    if (callback) { return callback(null); }
    return;
  }

  const mailoptions = {
    from: '"' + fromName + '" <' + fromAddress + '>',
    bcc: R.uniq(receiverEmailAddresses).toString(),
    subject,
    html,
    generateTextFromHTML: true
  };

  if (callback) { return transport.sendMail(mailoptions, callback); }

  transport.sendMail(mailoptions, err => {
    if (err) { return logger.error(err); }
    logger.info('Notification sent. Content: ' + JSON.stringify(mailoptions));
  });
}

module.exports = {
  transport,
  sendMail,
  sendBulkMail
};
