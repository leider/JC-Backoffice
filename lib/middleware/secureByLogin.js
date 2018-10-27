const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
const beans = require('simple-configure').get('beans');
const store = beans.get('userstore');

module.exports = function secureByLogin(req, res, next) {
  if (/\/upload|ical/.test(req.originalUrl)) {
    return next();
  }
  store.allUsers((err, users) => {
    if (err) { return next(err); }
    if ((users && users.length) && !/\/login/.test(req.originalUrl)) {
      return ensureLoggedIn(req, res, next);
    }
    next();
  });
};
