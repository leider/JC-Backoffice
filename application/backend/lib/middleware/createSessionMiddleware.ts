import session from "express-session";
import conf from "../../simpleConfigure.js";

/** Cookie name for the session id (must match clearCookie on logout). */
export const SESSION_COOKIE_NAME = "jc.sid";

export default function createSessionMiddleware() {
  const maxAge = conf.refreshTTL || 7 * 24 * 60 * 60 * 1000;
  const secret = conf.salt || "jc-backoffice-dev-secret-set-salt-in-config";
  const secure = process.env.NODE_ENV === "production";
  return session({
    name: SESSION_COOKIE_NAME,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure,
      maxAge,
    },
  });
}
