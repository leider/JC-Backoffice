import MailRule from "jc-shared/mail/mailRule";

import pers from "../persistence/persistence";
const persistence = pers("mailstore");

export default {
  all: async function all() {
    const result = await persistence.list({});
    return result.map((each) => new MailRule(each));
  },

  removeById: async function removeById(id: string) {
    const result = await persistence.removeById(id);
    return result ? new MailRule(result) : result;
  },

  save: async function save(mailRule: MailRule) {
    await persistence.save(mailRule.toJSON());
    return mailRule;
  },
};
