const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const persistence = beans.get('reservixPersistence');
const Salesreport = beans.get('salesreport');

function toOptionValues(callback, err, jsobject) {
  return misc.toObject(Salesreport, callback, err, jsobject);
}

module.exports = {
  getSalesreport: function getSalesreport(id, callback) {
    persistence.getById(id, R.partial(toOptionValues, [callback]));
  },

  saveAll: persistence.saveAll
};
