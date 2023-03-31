import passport from "passport";
import { ExtractJwt, Strategy, VerifiedCallback } from "passport-jwt";

import conf from "../../../shared/commons/simpleConfigure.js";
import { loggers } from "winston";
import store from "../users/userstore.js";
import Accessrights from "jc-shared/user/accessrights.js";

const jwtSecret = conf.get("salt") as string;
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

const appLogger = loggers.get("application");

passport.use(
  new Strategy(jwtOptions, async (jwtPayload: { id: string }, done: VerifiedCallback) => {
    const username = jwtPayload.id;
    try {
      const user = await store.forId(username);
      if (!user) {
        return done(null);
      }
      user.accessrights = new Accessrights(user);
      return done(null, user);
    } catch (e) {
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      appLogger.error((e as any)?.message || "");
      return done(e);
    }
  })
);

export default passport.initialize();
