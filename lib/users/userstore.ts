import { partial } from "lodash";
import misc from "../commons/misc";
import User from "./user";
import pers from "../persistence/persistence";
const persistence = pers("userstore");

function toUserObject(callback: Function, err: Error | null, jsobject?: object): void {
  return misc.toObject(User, callback, err, jsobject);
}

function toUserList(callback: Function, err: Error | null, jsobjects?: object[]): void {
  return misc.toObjectList(User, callback, err, jsobjects);
}

export default {
  allUsers: function allUsers(callback: Function): void {
    persistence.list({ name: 1 }, partial(toUserList, callback));
  },

  save: function save(user: User, callback: Function): void {
    delete user.password;
    persistence.save(user, callback);
  },

  saveAll: function saveAll(users: User[], callback: Function): void {
    users.forEach((u) => {
      delete u.password;
    });
    persistence.saveAll(users, callback);
  },

  forId: function forId(id: string, callback: Function): void {
    persistence.getById(id, partial(toUserObject, callback));
  },

  deleteUser: function deleteUser(id: string, callback: Function): void {
    persistence.removeById(id, (err: Error | null) => {
      callback(err);
    });
  },
};
