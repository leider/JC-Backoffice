'use strict';
/* eslint no-console: 0 */

require('./configure');
const beans = require('simple-configure').get('beans');
const htmlbridge = beans.get('htmlbridge');
const reservixPersistence = beans.get('reservixPersistence');

function load(datumString, results, callback) {
  htmlbridge.loadSalesreports(datumString, (err, rawresults) => {
    if (rawresults && rawresults.length > 0) {
      const lastrow = rawresults[rawresults.length - 1];
      const lastrowAbsolute = results[results.length - 1];
      if (results && results.length > 0 && lastrow.id === lastrowAbsolute.id) {
        return callback(results);
      }
      const newDatumString = lastrow.datum.tagMonatJahrKompakt();
      results = results.concat(rawresults);
      load(newDatumString, results, callback);
    } else {
      callback(results);
    }
  });
}

load('01.07.2018', [], results => {
  const now = new Date();
  const resultsToSave = results.map(each => {
    each.datum = each.datum.toJSDate();
    each.updated = now;
    return each;
  });

  reservixPersistence.saveAll(resultsToSave, err => {
    if (err) {
      console.log(err);
    }
    /*eslint no-process-exit: 0 */
    process.exit();
  });
});
