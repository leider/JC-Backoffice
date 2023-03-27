import MailRule from "jc-shared/mail/mailRule.js";

import pers from "../persistence/persistence.js";
import misc from "jc-shared/commons/misc.js";
const persistence = pers("mailstore");

export default {
  all: async function all() {
    const result = await persistence.list({});
    return misc.toObjectList(MailRule, result);
  },

  removeById: async function removeById(id: string) {
    const result = await persistence.removeById(id);
    return misc.toObject(MailRule, result);
  },

  save: async function save(mailRule: MailRule) {
    await persistence.save(mailRule.toJSON());
    return mailRule;
  },
};
