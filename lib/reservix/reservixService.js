const beans = require('simple-configure').get('beans');
const reservixstore = beans.get('reservixstore');
const htmlbridge = beans.get('htmlbridge');
const Salesreport = beans.get('salesreport');

function updateSalesreports(callback) {
  htmlbridge.loadSalesreports(null, (err, results) => {
    if (err || !results) {
      return callback(err);
    }
    const now = new Date();
    const resultsToSave = results.map(each => {
      each.datum = each.datum.toDate();
      each.updated = now;
      return each;
    });

    reservixstore.saveAll(resultsToSave, err1 => {
      if (err1) {
        return callback(err1);
      }
      callback();
    });
  });
}

function salesreportFor(eventID, callback) {
  if (!eventID) {
    return callback(new Salesreport());
  }
  reservixstore.getSalesreport(eventID, (err, report) => {
    if (err || !report || report.istVeraltet()) {
      // neuer Request, speichern und dann nochmal laden!
      updateSalesreports(err1 => {
        if (err1) {
          return callback(report || new Salesreport());
        }
        reservixstore.getSalesreport(eventID, (err2, reportAktualisiert) => {
          return callback(reportAktualisiert || new Salesreport());
        });
      });
    } else {
      callback(report || new Salesreport());
    }
  });
}

module.exports = {
  salesreportFor
};
