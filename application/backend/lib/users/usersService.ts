import User, { BOOKING, SUPERUSERS } from "jc-shared/user/user.js";

import store from "./userstore.js";
import { genSalt, hashPassword } from "../commons/hashPassword.js";
import { MailAddress } from "jc-shared/mail/mailMessage.js";
import filter from "lodash/filter.js";
import map from "lodash/map.js";

export default {
  saveNewUserWithPassword: function saveNewUserWithPassword(userToSave: User, user: User) {
    const password = userToSave.password;
    if (!password) {
      throw new Error("Kein Passwort übermittelt");
    }
    delete userToSave.password;
    const existingUser = store.forId(userToSave.id);
    if (existingUser) {
      throw new Error(`Benutzer mit Id '${userToSave.id}' existiert schon`);
    }
    const newSalt = genSalt();
    userToSave.salt = newSalt;
    userToSave.hashedPassword = hashPassword(password, newSalt);
    return store.save(userToSave, user);
  },

  changePassword: function changePassword(userToSave: User, user: User) {
    const password = userToSave.password;
    if (!password) {
      throw new Error("Kein Passwort übermittelt");
    }
    delete userToSave.password;
    const existingUser = store.forId(userToSave.id);
    if (!existingUser) {
      return null;
    }
    const newSalt = genSalt();
    existingUser.salt = newSalt;
    existingUser.hashedPassword = hashPassword(password, newSalt);
    return store.save(existingUser, user);
  },

  emailsAllerBookingUser: function emailsAllerBookingUser(): MailAddress[] {
    const users = store.allUsers();
    return map(
      filter(users, (user) => user.email && (user.gruppen?.includes(BOOKING) || user.gruppen?.includes(SUPERUSERS))) as User[],
      (u) => ({ name: u.name, address: u.email }),
    );
  },

  emailsAllerAdmins: function emailsAllerAdmins(): MailAddress[] {
    const users = store.allUsers();
    return map(filter(users, (user) => user.email && user.gruppen?.includes(SUPERUSERS)) as User[], (u) => ({
      name: u.name,
      address: u.email,
    }));
  },
};
