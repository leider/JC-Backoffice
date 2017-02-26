/*global emit */

const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const persistence = beans.get('optionenPersistence');
const OptionValues = beans.get('optionValues');

function toOptionValues(callback, err, jsobject) {
  return misc.toObject(OptionValues, callback, err, jsobject);
}

module.exports = {
  get: function get(callback) {
    persistence.getById('instance', R.partial(toOptionValues, [callback]));
  },

  save: function save(optionValues, callback) {
    persistence.save(optionValues.state, callback);
  }
};
