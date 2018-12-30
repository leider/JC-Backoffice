const beans = require('simple-configure').get('beans');
const R = require('ramda');

const misc = beans.get('misc');
const User = beans.get('user');
const persistence = beans.get('usersPersistence');

function toUserObject(callback, err, jsobject) {
  return misc.toObject(User, callback, err, jsobject);
}

function toUserList(callback, err, jsobjects) {
  if (err) { return callback(err); }
  callback(null, jsobjects.map(record => new User(record)));
}

module.exports = {
  allUsers: function allUsers(callback) {
    persistence.list({id: 1}, R.partial(toUserList, [callback]));
  },

  save: function save(user, callback) {
    persistence.save(user, callback);
  },

  forId: function forId(id, callback) {
    persistence.getById(id, R.partial(toUserObject, [callback]));
  },

  deleteUser: function deleteUser(id, callback) {
    persistence.removeById(id, err => {
      callback(err);
    });
  }
};
