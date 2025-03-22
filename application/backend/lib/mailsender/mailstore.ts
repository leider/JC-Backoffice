import MailRule from "jc-shared/mail/mailRule.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import User from "jc-shared/user/user.js";

const persistence = pers("mailstore");

export default {
  all: function all() {
    const result = persistence.list();
    return misc.toObjectList(MailRule, result);
  },

  removeById: function removeById(id: string, user: User) {
    persistence.removeById(id, user);
  },

  removeAll: function removeAll(ids: string[], user: User) {
    persistence.removeAllByIds(ids, user);
  },

  save: function save(mailRule: MailRule, user: User) {
    persistence.save(mailRule, user);
    return mailRule;
  },

  saveAll: function saveAll(mailRules: MailRule[], user: User) {
    persistence.saveAll(mailRules, user);
    return mailRules;
  },
};
