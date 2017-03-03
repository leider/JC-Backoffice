const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
const beans = require('simple-configure').get('beans');
const store = beans.get('userstore');

module.exports = function secureByLogin(req, res, next) {
  store.allUsers((err, users) => {
    if (err) { return next(err); }
    if ((users && users.length) && !/\/login/.test(req.originalUrl)) {
      if (req.method === 'POST') {
        req.session.previousBody = req.body;
      }
      return ensureLoggedIn(req, res, next);
    }
    next();
  });
};
