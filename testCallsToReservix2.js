/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('./configure');

const conf = require('simple-configure');
const beans = conf.get('beans');
const salesreport = beans.get('salesreport');
const reservixAPI = beans.get('reservixAPI');

const moment = require('moment-timezone');
const last14Days = moment();
last14Days.subtract(14, 'd');

reservixAPI.allSalesSince(last14Days, result => {
  if (!result) {
    process.exit();
  }
  console.log(result.data.map(each => salesreport.forOneResult(each.eventId, result.tsServer, each)).map(each => each.state));
  process.exit();
})
