const crypto = require('crypto');

const conf = require('simple-configure');

function hashPassword(password) {
  const salt = conf.get('salt') || '1234567890';
  /*eslint no-sync: 0 */
  return crypto.pbkdf2Sync(password, salt, 100000, 512, 'sha512').toString('hex');
}

module.exports = hashPassword;
