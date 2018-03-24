/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('./configure');
const beans = require('simple-configure').get('beans');
const optionenstore = beans.get('optionenstore');
const EmailAddresses = beans.get('emailAddresses');

optionenstore.get((err1, optionen) => {
  if (err1) {
    console.log(err1);
    process.exit();
  }
  if (!optionen.state.partner1) {
    console.log('nix zu migrieren');
    process.exit();
  }
  const emailAddresses = new EmailAddresses();
  optionen.noOfEmails().forEach(i => {
    emailAddresses.state['partner' + i] = optionen.state['partner' + i];
    emailAddresses.state['email' + i] = optionen.state['email' + i];
    delete optionen.state['partner' + i];
    delete optionen.state['email' + i];
  });
  optionenstore.save(emailAddresses, err => {
    if (err) {
      console.log(err);
    }
    optionenstore.save(optionen, err2 => {
      if (err2) {
        console.log(err2);
      }
      process.exit();
    });
  });
});
