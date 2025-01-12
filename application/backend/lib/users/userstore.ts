import User from "jc-shared/user/user.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";
import map from "lodash/map.js";
import omit from "lodash/omit.js";

const persistence = pers("userstore");

export default {
  allUsers: function allUsers() {
    const result = persistence.list("data->>'$.name' ASC");
    return misc.toObjectList(User, result);
  },

  save: function save(userToSave: User, user: User) {
    const withoutPass = omit(userToSave, "password");
    persistence.save(withoutPass, user);
    return withoutPass;
  },

  saveAll: function saveAll(users: User[], user: User) {
    const allWithoutPass = map(users, (each) => omit(each, "password"));
    persistence.saveAll(allWithoutPass, user);
    return allWithoutPass;
  },

  forId: function forId(id: string) {
    const result = persistence.getById(id);
    return misc.toObject(User, result);
  },

  deleteUser: function deleteUser(id: string, user: User) {
    return persistence.removeById(id, user);
  },
};
