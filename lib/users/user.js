const conf = require('simple-configure');
const beans = conf.get('beans');
const { genSalt, hashPassword } = beans.get('hashPassword');

class User {
  constructor(object) {
    this.state = object ? object : {};
    ['id', 'name', 'email', 'tel', 'tshirt', 'hashedPassword', 'salt'].forEach(
      field => {
        this[field] = object[field] || '';
      }
    );
    ['gruppen', 'rechte'].forEach(field => {
      this[field] = object[field] || [];
    });
    if (object.password) {
      this.updatePassword(object.password);
    }
  }

  updatePassword(newPass) {
    this.salt = genSalt();
    this.hashedPassword = hashPassword(newPass, this.salt);
  }
}

module.exports = User;
