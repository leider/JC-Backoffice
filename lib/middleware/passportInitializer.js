const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const winston = require('winston');
const appLogger = winston.loggers.get('application');

const beans = require('simple-configure').get('beans');
const store = beans.get('userstore');
const hashPassword = beans.get('hashPassword');

passport.use(new Strategy(
  (username, password, done) => {
    store.forId(username, (err, user) => {
      appLogger.info('Login for: ' + username);
      if (err || !user) {
        appLogger.error('Login error for: ' + username);
        appLogger.error(err);
        return done(err);
      }
      if (hashPassword(password) === user.hashedPassword) {
        return done(null, {id: username});
      }
      done(null, false);
    });
  })
);

function serializeUser(user, done) {
  return done(null, user.id);
}

function deserializeUser(id, done) {
  store.forId(id, (err, user) => {
    done(err, user);
  });
}

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

module.exports = [passport.initialize(), passport.session()];
