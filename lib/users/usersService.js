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
      const user = existingUser || {id: username, hashedPassword: hashPassword(password)};
      store.save(user, err1 => {
        user.password = password;
        callback(err1, user);
      });
    });
  }
};
