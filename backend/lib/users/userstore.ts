import User from "jc-shared/user/user";

import pers from "../persistence/persistenceNew";
const persistence = pers("userstore");

export default {
  allUsers: async function allUsers() {
    const result = await persistence.list({ name: 1 });
    return result.map((each) => new User(each));
  },

  save: async function save(user: User) {
    delete user.password;
    return persistence.save(user);
  },

  saveAll: async function saveAll(users: User[]) {
    users.forEach((u) => {
      delete u.password;
    });
    return persistence.saveAll(users);
  },

  forId: async function forId(id: string) {
    const result = await persistence.getById(id);
    return result ? new User(result) : result;
  },

  deleteUser: async function deleteUser(id: string) {
    return persistence.removeById(id);
  },
};
