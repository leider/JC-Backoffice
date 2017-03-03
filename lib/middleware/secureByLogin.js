const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/login');
// const securedByLoginURLRegex = new RegExp('/veranstaltungen|/optionen');

module.exports = function secureByLogin(req, res, next) {
  if (!/\/login/.test(req.originalUrl)) {
    if (req.method === 'POST') {
      req.session.previousBody = req.body;
    }
    return ensureLoggedIn(req, res, next);
  }
  next();
};
