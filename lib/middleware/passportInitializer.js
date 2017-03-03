const passport = require('passport');

function serializeUser(user, done) {
  return done(null, user.id);
}

function deserializeUser(id, done) {
    done(null, {id: id});
}

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

module.exports = [passport.initialize(), passport.session()];
