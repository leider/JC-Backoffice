import User from "jc-shared/user/user.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";

const persistence = pers("userstore");

export default {
  allUsers: function allUsers() {
    const result = persistence.list("data->>'$.name' ASC");
    return misc.toObjectList<User>(User, result);
  },

  save: function save(user: User) {
    delete user.password;
    persistence.save(user);
    return user;
  },

  saveAll: function saveAll(users: User[]) {
    users.forEach((u) => {
      delete u.password;
    });
    persistence.saveAll(users);
    return users;
  },

  forId: function forId(id: string) {
    const result = persistence.getById(id);
    return misc.toObject<User>(User, result);
  },

  deleteUser: function deleteUser(id: string) {
    return persistence.removeById(id);
  },
};
