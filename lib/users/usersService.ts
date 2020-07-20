import { generate } from "generate-password";

import store from "./userstore";
import { hashPassword, genSalt } from "../commons/hashPassword";
import User from "./user";

export default {
  saveNewUser: function saveNewUser(username: string, callback: Function): void {
    const password = generate({
      excludeSimilarCharacters: true,
      length: 10,
      numbers: true,
      symbols: true,
    });
    store.forId(username, (err: Error | null, existingUser?: User) => {
      if (err) {
        return callback(err);
      }
      const newSalt = genSalt();
      const user =
        existingUser ||
        new User({
          id: username,
          gruppen: [],
        });
      user.salt = newSalt;
      user.hashedPassword = hashPassword(password, newSalt);

      return store.save(user, (err1: Error | null) => {
        user.password = password; // to give UI feedback, called after save!
        callback(err1, user);
      });
    });
  },

  updatePassword: function updatePassword(username: string, password: string, callback: Function): void {
    store.forId(username, (err: Error | null, existingUser?: User) => {
      if (err || !existingUser) {
        return callback(err);
      }
      existingUser.salt = genSalt();
      existingUser.hashedPassword = hashPassword(password, existingUser.salt);
      return store.save(existingUser, (err1: Error | null) => {
        existingUser.password = password; // to give UI feedback, called after save!
        callback(err1, existingUser);
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
