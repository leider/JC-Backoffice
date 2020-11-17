import passport from "passport";
import { Strategy } from "passport-local";

import { loggers } from "winston";
const appLogger = loggers.get("application");

import store from "../users/userstore";
import User from "../../../shared/user/user";
import { hashPassword } from "../commons/hashPassword";

passport.use(
  new Strategy((username, password, done) => {
    store.forId(username, (err: Error | null, user: User) => {
      appLogger.info("Login for: " + username);
      if (err || !user) {
        appLogger.error("Login error for: " + username);
        appLogger.error(err?.message || "");
        return done(err);
      }
      if (hashPassword(password, user.salt) === user.hashedPassword) {
        return done(null, { id: username });
      }
      return done(null, false);
    });
  })
);

function serializeUser(user: User, done: Function): void {
  return done(null, user.id);
}

function deserializeUser(id: string, done: Function): void {
  store.forId(id, (err: Error | null, user: User) => {
    done(err, user);
  });
}

passport.serializeUser(serializeUser);
passport.deserializeUser(deserializeUser);

export default [passport.initialize(), passport.session()];
