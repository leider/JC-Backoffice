const beans = require('simple-configure').get('beans');
const reservixAPI = beans.get('reservixAPI');
const Salesreport = beans.get('salesreport');

function salesreportFor(eventID, callback) {
  reservixAPI.salesreport(eventID, result => {
    if (eventID) {
      return callback(Salesreport.forRawResult(eventID, result));
    }
    return null;
  });
}

module.exports = {
  salesreportFor
};
