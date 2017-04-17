const passport = require('passport');
const Strategy = require('passport-local').Strategy;

const beans = require('simple-configure').get('beans');
const store = beans.get('userstore');
const hashPassword = beans.get('hashPassword');

passport.use(new Strategy(
  (username, password, done) => {
    store.forId(username, (err, user) => {
      if (err) { return done(err); }
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
  done(null, {id: id});
}

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

module.exports = [passport.initialize(), passport.session()];
