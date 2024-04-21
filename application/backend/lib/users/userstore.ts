import User from "jc-shared/user/user.js";

import pers from "../persistence/sqlitePersistence.js";
import misc from "jc-shared/commons/misc.js";

const persistence = pers("userstore");

export default {
  allUsers: function allUsers() {
    const result = persistence.list("data->>'$.name' ASC");
    return misc.toObjectList<User>(User, result);
  },

  save: function save(userToSave: User, user: User) {
    delete userToSave.password;
    persistence.save(userToSave, user);
    return userToSave;
  },

  saveAll: function saveAll(users: User[], user: User) {
    users.forEach((u) => {
      delete u.password;
    });
    persistence.saveAll(users, user);
    return users;
  },

  forId: function forId(id: string) {
    const result = persistence.getById(id);
    return misc.toObject<User>(User, result);
  },

  deleteUser: function deleteUser(id: string, user: User) {
    return persistence.removeById(id, user);
  },
};
