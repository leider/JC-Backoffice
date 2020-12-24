import partial from "lodash/partial";

import misc from "../../../shared/commons/misc";
import MailRule from "../../../shared/mail/mailRule";

import pers from "../persistence/persistence";
const persistence = pers("mailstore");

function toMailRule(callback: Function, err: Error | null, jsobject: object): void {
  return misc.toObject(MailRule, callback, err, jsobject);
}

function toMailRuleList(callback: Function, err: Error | null, jsobjects: object[]): void {
  return misc.toObjectList(MailRule, callback, err, jsobjects);
}

export default {
  all: function all(callback: Function): void {
    persistence.list({}, partial(toMailRuleList, callback));
  },

  removeById: function removeById(id: string, callback: Function): void {
    persistence.removeById(id, partial(toMailRule, callback));
  },

  forId: function forId(id: string, callback: Function): void {
    persistence.getById(id, partial(toMailRule, callback));
  },

  save: function save(mailRule: MailRule, callback: Function): void {
    persistence.save(mailRule.toJSON(), callback);
  },
};
