import passport from "passport";
import { Strategy, ExtractJwt, VerifiedCallback } from "passport-jwt";

import conf from "../commons/simpleConfigure";
const jwtSecret = conf.get("salt") as string;
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

import { loggers } from "winston";
const appLogger = loggers.get("application");

import store from "../users/userstore";
import User from "jc-shared/user/user";
import Accessrights from "jc-shared/user/accessrights";

passport.use(
  new Strategy(jwtOptions, (jwtPayload: { id: string }, done: VerifiedCallback) => {
    const username = jwtPayload.id;
    store.forId(username, (err: Error | null, user: User) => {
      if (err || !user) {
        appLogger.error(err?.message || "");
        return done(err);
      }
      user.accessrights = new Accessrights(user);
      return done(null, user);
    });
  })
);

export default passport.initialize();
