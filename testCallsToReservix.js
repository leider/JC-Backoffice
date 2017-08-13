/*eslint no-process-exit: 0 */
/* eslint no-console: 0 */
'use strict';

require('./configure');
const beans = require('simple-configure').get('beans');
const reservixAPI = beans.get('reservixAPI');

reservixAPI.allEvents(result => {
  if (!result) {
    process.exit();
  }
  const toshow = result.data.map(each => {
    return {
      id: each.id, startdate: each.startdate, starttime: each.starttime, canonicalUrl: each.canonicalUrl
    };
  });
  
  console.log(toshow);
  process.exit();
});
// reservixAPI.salesreport('974106', result => {
//   if (!result) {
//     process.exit();
//   }
//   console.log(result);
//   process.exit();
// });
