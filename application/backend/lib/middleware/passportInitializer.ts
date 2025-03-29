import passport from "passport";
import { ExtractJwt, Strategy, VerifiedCallback } from "passport-jwt";

import conf from "../../simpleConfigure.js";
import { loggers } from "winston";
import store from "../users/userstore.js";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: conf.salt ?? "123",
};

const appLogger = loggers.get("application");

passport.use(
  new Strategy(jwtOptions, (jwtPayload: { id: string }, done: VerifiedCallback) => {
    const username = jwtPayload.id;
    try {
      const user = store.forId(username);
      if (!user) {
        return done(null);
      }
      return done(null, user);
    } catch (e) {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      appLogger.error((e as any)?.message || "");
      return done(e);
    }
  }),
);

export default passport.initialize();
