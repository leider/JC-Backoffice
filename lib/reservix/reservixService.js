const beans = require('simple-configure').get('beans');
const reservixAPI = beans.get('reservixAPI');
const Salesreport = beans.get('salesreport');

function salesreportFor(eventID, callback) {
  if (eventID) {
    return reservixAPI.salesreport(eventID, result => {
      callback(Salesreport.forRawResult(eventID, result));
    });
  }
  return callback(new Salesreport());
}

module.exports = {
  salesreportFor
};
