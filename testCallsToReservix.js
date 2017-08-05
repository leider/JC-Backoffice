/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('./configure');
const beans = require('simple-configure').get('beans');
const reservixAPI = beans.get('reservixAPI');

reservixAPI.salesreport('974106', result => {
  if (!result) {
    process.exit();
  }
  console.log(result);
  process.exit();
});
