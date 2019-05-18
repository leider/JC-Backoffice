const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const persistence = beans.get('optionenPersistence');
const OptionValues = beans.get('optionValues');
const EmailAddresses = beans.get('emailAddresses');
const Orte = beans.get('orte');
const FerienIcals = beans.get('ferienIcals');

function toOptionValues(callback, err, jsobject) {
  return misc.toObject(OptionValues, callback, err, jsobject);
}

function toEmailAddresses(callback, err, jsobject) {
  return misc.toObject(EmailAddresses, callback, err, jsobject);
}

function toOrte(callback, err, jsobject) {
  return misc.toObject(Orte, callback, err, jsobject);
}

function toIcals(callback, err, jsobject) {
  return misc.toObject(FerienIcals, callback, err, jsobject);
}

module.exports = {
  get: function get(callback) {
    persistence.getById('instance', R.partial(toOptionValues, [callback]));
  },

  emailAddresses: function emailAddresses(callback) {
    persistence.getById(
      'emailaddresses',
      R.partial(toEmailAddresses, [callback])
    );
  },

  orte: function orte(callback) {
    persistence.getById('orte', R.partial(toOrte, [callback]));
  },

  icals: function ferienIcals(callback) {
    persistence.getById('ferienIcals', R.partial(toIcals, [callback]));
  },

  save: function save(object, callback) {
    persistence.save(object.state, callback);
  }
};
