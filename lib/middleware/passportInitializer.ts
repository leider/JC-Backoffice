import passport from 'passport';
import { Strategy } from 'passport-local';

import { loggers } from 'winston';
const appLogger =   loggers.get('application');

const beans = require('simple-configure').get('beans');
import store from '../users/userstore';
const { hashPassword } = beans.get('hashPassword');

passport.use(
  new Strategy((username, password, done) => {
    store.forId(username, (err: any, user: any) => {
      appLogger.info('Login for: ' + username);
      if (err || !user) {
        appLogger.error('Login error for: ' + username);
        appLogger.error(err);
        return done(err);
      }
      if (hashPassword(password, user.salt) === user.hashedPassword) {
        return done(null, { id: username });
      }
      done(null, false);
    });
  })
);

function serializeUser(user: any, done: Function) {
  return done(null, user.id);
}

function deserializeUser(id: string, done: Function) {
  store.forId(id, (err: any, user: any) => {
    done(err, user);
  });
}

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

export default [passport.initialize(), passport.session()];
