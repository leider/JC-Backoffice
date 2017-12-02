const beans = require('simple-configure').get('beans');

const persistence = beans.get('usersPersistence');

module.exports = {
  allUsers: function allUsers(callback) {
    persistence.list({id: 1}, callback);
  },

  save: function save(user, callback) {
    persistence.save(user, callback);
  },

  forId: function forId(id, callback) {
    persistence.getById(id, callback);
  },

  deleteUser: function deleteUser(id, callback) {
    persistence.removeById(id, err => {
      callback(err);
    });
  }
};
