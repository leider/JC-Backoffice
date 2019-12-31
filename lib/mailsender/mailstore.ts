import misc from '../commons/misc';
import R from 'ramda';
import MailRule from './mailRule';

import pers from '../persistence/persistence';
const persistence = pers('mailstore');

function toMailRule(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject2(MailRule, callback, err, jsobject);
}

function toMailRuleList(callback: Function, err: Error | null, jsobjects: object[]): void {
  return misc.toObjectList2(MailRule, callback, err, jsobjects);
}

export default {
  all: function all(callback: Function): void {
    persistence.list({}, R.partial(toMailRuleList, [callback]));
  },

  forId: function forId(id: string, callback: Function): void {
    persistence.getById(id, R.partial(toMailRule, [callback]));
  },

  save: function save(mailRule: MailRule, callback: Function): void {
    persistence.save(mailRule.toJSON(), callback);
  }
};
