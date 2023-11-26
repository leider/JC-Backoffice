import MailRule from "jc-shared/mail/mailRule.js";

import pers from "../persistence/persistence.js";
import misc from "jc-shared/commons/misc.js";
import Termin from "jc-shared/optionen/termin.js";
const persistence = pers("mailstore");

export default {
  all: async function all() {
    const result = await persistence.list({});
    return misc.toObjectList<MailRule>(MailRule, result);
  },

  removeById: async function removeById(id: string) {
    const result = await persistence.removeById(id);
    return misc.toObject<MailRule>(MailRule, result);
  },

  removeAll: async function removeAll(ids: string[]) {
    return persistence.removeAllByIds(ids);
  },

  save: async function save(mailRule: MailRule) {
    await persistence.save(mailRule.toJSON());
    return mailRule;
  },

  saveAll: async function saveAll(termine: Termin[]) {
    await persistence.saveAll(termine);
    return termine;
  },
};
