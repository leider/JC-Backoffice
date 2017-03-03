const generator = require('generate-password');

const beans = require('simple-configure').get('beans');
const store = beans.get('userstore');
const hashPassword = beans.get('hashPassword');

module.exports = {

  save: function save(username, callback) {
    const password = generator.generate({
      excludeSimilarCharacters: true,
      length: 10,
      numbers: true,
      symbols: true
    });
    const user = {id: username, hashedPassword: hashPassword(password)};
    store.save(user, err => {
      user.password = password;
      callback(err, user);
    });
  }
};
