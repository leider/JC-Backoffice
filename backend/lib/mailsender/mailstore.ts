import MailRule from "jc-shared/mail/mailRule.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";

const persistence = pers("mailstore");

export default {
  all: function all() {
    const result = persistence.list();
    return misc.toObjectList<MailRule>(MailRule, result);
  },

  removeById: function removeById(id: string) {
    const result = persistence.removeById(id);
    return misc.toObject<MailRule>(MailRule, result);
  },

  removeAll: function removeAll(ids: string[]) {
    return persistence.removeAllByIds(ids);
  },

  save: function save(mailRule: MailRule) {
    persistence.save(mailRule.toJSON());
    return mailRule;
  },

  saveAll: function saveAll(mailRules: MailRule[]) {
    persistence.saveAll(mailRules);
    return mailRules;
  },
};
