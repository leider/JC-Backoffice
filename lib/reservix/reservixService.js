const beans = require('simple-configure').get('beans');
const reservixAPI = beans.get('reservixAPI');
const reservixstore = beans.get('reservixstore');
const Salesreport = beans.get('salesreport');

function salesreportFor(eventID, callback) {
  if (!eventID) {
    return callback(new Salesreport());
  }
  reservixstore.getSalesreport(eventID, (err, report) => {
    if (err || !report || report.istVeraltet()) {
      reservixAPI.salesreport(eventID, result => {
        if (result && result.errorCode !== 404) {
          const salesreport = Salesreport.forRawResult(eventID, result);
          reservixstore.saveSalesreport(salesreport, () => {
            callback(salesreport);
          });
        } else {
          callback(report || new Salesreport());
        }
      });
    } else {
      callback(report || new Salesreport());
    }
  });
}

module.exports = {
  salesreportFor
};
