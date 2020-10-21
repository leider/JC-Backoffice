import { generate } from "generate-password";

import store from "./userstore";
import { hashPassword, genSalt } from "../commons/hashPassword";
import User from "./user";

export default {
  saveNewUserWithPassword: function saveNewUserWithPassword(user: User, callback: Function): void {
    const password = user.password;
    if (!password) {
      return callback(null, "Kein Passwort übermittelt");
    }
    delete user.password;
    store.forId(user.id, (err: Error | null, existingUser?: User) => {
      if (err) {
        return callback(err);
      }
      if (existingUser) {
        return callback(null, "Benutzer mit Id '" + user.id + "' existiert schon");
      }
      const newSalt = genSalt();
      user.salt = newSalt;
      user.hashedPassword = hashPassword(password, newSalt);
      return store.save(user, (err1: Error | null) => {
        callback(err1);
      });
    });
  },

  changePassword: function changePassword(user: User, callback: Function): void {
    const password = user.password;
    if (!password) {
      return callback(null, "Kein Passwort übermittelt");
    }
    delete user.password;
    store.forId(user.id, (err: Error | null, existingUser?: User) => {
      if (err || !existingUser) {
        return callback(err);
      }
      const newSalt = genSalt();
      existingUser.salt = newSalt;
      existingUser.hashedPassword = hashPassword(password, newSalt);
      return store.save(existingUser, (err1: Error | null) => {
        callback(err1);
      });
    });
  },

  emailsAllerBookingUser: function emailsAllerBookingUser(callback: Function): void {
    store.allUsers((err: Error | null, users: User[]) => {
      const emails = users
        .filter((user) => (user.gruppen || []).includes("bookingTeam") || (user.gruppen || []).includes("superusers"))
        .filter((user) => !!user.email)
        .map((u) => u.email);
      callback(err, emails);
    });
  },
};
