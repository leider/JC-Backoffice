/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('./configure');
require('./initWinston');
const optionenstore = require('./lib/mailsender/sendMailsNightly.js');

optionenstore.checkFluegel(
  () => {
    process.exit();
  }
);
