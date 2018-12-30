const generator = require('generate-password');

const beans = require('simple-configure').get('beans');
const store = beans.get('userstore');
const hashPassword = beans.get('hashPassword');

module.exports = {

  saveNewUser: function saveNewUser(username, callback) {
    const password = generator.generate({
      excludeSimilarCharacters: true,
      length: 10,
      numbers: true,
      symbols: true
    });
    store.forId(username, (err, existingUser) => {
      if (err) { return callback(err); }
      const user = existingUser || {id: username, hashedPassword: hashPassword(password), gruppen: []};
      store.save(user, err1 => {
        user.password = password; // to give UI feedback, called after save!
        callback(err1, user);
      });
    });
  },

  updatePassword: function updatePassword(username, password, callback) {
    store.forId(username, (err, existingUser) => {
      if (err || !existingUser) { return callback(err); }
      existingUser.updatePassword(password);
      store.save(existingUser, err1 => {
        existingUser.password = password; // to give UI feedback, called after save!
        callback(err1, existingUser);
      });
    });
  },

  emailsAllerBookingUser: function emailsAllerBookingUser(callback) {
    store.allUsers((err, users) => {
      const emails = users
        .filter(user =>
          (user.gruppen || []).includes('bookingTeam') || (user.gruppen || []).includes('superusers'))
        .map(u => u.email);
      callback(err, emails);
    });
  }
};
