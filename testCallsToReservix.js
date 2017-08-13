/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

const async = require('async');
require('./configure');
const beans = require('simple-configure').get('beans');
const reservixAPI = beans.get('reservixAPI');
const reservixService = beans.get('reservixService');

reservixAPI.allEvents(result => {
  if (!result) {
    process.exit();
  }
  // const toshow = result.data.map(each => {
  //   return {
  //     id: each.id, startdate: each.startdate, starttime: each.starttime, canonicalUrl: each.canonicalUrl
  //   };
  // });

  function fetchSalesreport(each, callback) {
    reservixService.salesreportFor(each.id, salesreport => {
      callback(null, salesreport);
    });
  }

  async.map(result.data, fetchSalesreport, (err, res) => {
    console.log(res.map(each => each.state).filter(each => each.id !== undefined));
    process.exit();
  });

  // console.log(toshow);
  // process.exit();
});
// reservixAPI.salesreport('974106', result => {
//   if (!result) {
//     process.exit();
//   }
//   console.log(result);
//   process.exit();
// });
