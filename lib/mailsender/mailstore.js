const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const persistence = beans.get('mailPersistence');
const MailRule = beans.get('mailRule');

function toMailRule(callback, err, jsobject) {
  return misc.toObject(MailRule, callback, err, jsobject);
}

function toMailRuleList(callback, err, jsobjects) {
  return misc.toObjectList(MailRule, callback, err, jsobjects);
}

module.exports = {
  all: function all(callback) {
    persistence.list({}, R.partial(toMailRuleList, [callback]));
  },

  forId: function forId(id, callback) {
    persistence.getById(id, R.partial(toMailRule, [callback]));
  },

  save: function save(mailRule, callback) {
    persistence.save(mailRule.state, callback);
  }
};
