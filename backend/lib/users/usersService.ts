import User from "jc-shared/user/user";

import store from "./userstore";
import { hashPassword, genSalt } from "../commons/hashPassword";

export default {
  saveNewUserWithPassword: async function saveNewUserWithPassword(user: User) {
    const password = user.password;
    if (!password) {
      throw new Error("Kein Passwort übermittelt");
    }
    delete user.password;
    const existingUser = await store.forId(user.id);
    if (existingUser) {
      throw new Error(`Benutzer mit Id '${user.id}' existiert schon`);
    }
    const newSalt = genSalt();
    user.salt = newSalt;
    user.hashedPassword = hashPassword(password, newSalt);
    return store.save(user);
  },

  changePassword: async function changePassword(user: User) {
    const password = user.password;
    if (!password) {
      throw new Error("Kein Passwort übermittelt");
    }
    delete user.password;
    const existingUser = await store.forId(user.id);
    if (!existingUser) {
      return null;
    }
    const newSalt = genSalt();
    existingUser.salt = newSalt;
    existingUser.hashedPassword = hashPassword(password, newSalt);
    return store.save(existingUser);
  },

  emailsAllerBookingUser: async function emailsAllerBookingUser() {
    const users = await store.allUsers();
    const emails = users
      .filter((user) => (user.gruppen || []).includes("bookingTeam") || (user.gruppen || []).includes("superusers"))
      .filter((user) => !!user.email)
      .map((u) => u.email);
    return emails;
  },
};
