import misc from '../commons/misc';
import R from 'ramda';
import MailRule from './mailRule';

import pers from '../persistence/persistence';
const persistence = pers('mailstore');

function toMailRule(callback: Function, err: Error | null, jsobject: any) {
  return misc.toObject(MailRule, callback, err, jsobject);
}

function toMailRuleList(callback: Function, err: Error | null, jsobjects: any) {
  return misc.toObjectList(MailRule, callback, err, jsobjects);
}

export default {
  all: function all(callback: Function) {
    persistence.list({}, R.partial(toMailRuleList, [callback]));
  },

  forId: function forId(id: string, callback: Function) {
    persistence.getById(id, R.partial(toMailRule, [callback]));
  },

  save: function save(mailRule: MailRule, callback: Function) {
    persistence.save(mailRule.state, callback);
  }
};
