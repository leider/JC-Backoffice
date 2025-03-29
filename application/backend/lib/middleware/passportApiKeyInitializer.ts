import passport from "passport";
import { Strategy } from "passport-http-bearer";

import conf from "../../simpleConfigure.js";
import { loggers } from "winston";

const appLogger = loggers.get("application");

passport.use(
  new Strategy((token, done) => {
    if (token === conf.bearer) {
      return done(null, {}); // empty "user" needed
    }
    appLogger.warn("bad token", token);
    return done(null, false);
  }),
);

export default passport.initialize();
