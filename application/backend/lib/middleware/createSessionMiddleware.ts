import session from "express-session";
import conf from "../../simpleConfigure.js";
import { db } from "../persistence/sqlitePersistence.js";
import SqliteSessionStore from "./SqliteSessionStore.js";

/** Cookie name for the session id (must match clearCookie on logout). */
export const SESSION_COOKIE_NAME = "jc.sid";

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/** Options that must match `clearCookie` for the session cookie. */
export function sessionCookieClearOptions() {
  return {
    path: "/" as const,
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isProduction(),
  };
}

export default function createSessionMiddleware() {
  const maxAge = conf.refreshTTL || 7 * 24 * 60 * 60 * 1000;
  const secret = conf.salt || "jc-backoffice-dev-secret-set-salt-in-config";
  const secure = isProduction();
  const store = new SqliteSessionStore(db, maxAge);

  return session({
    name: SESSION_COOKIE_NAME,
    secret,
    resave: false,
    saveUninitialized: false,
    store,
    proxy: isProduction() ? true : undefined,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure,
      maxAge,
    },
  });
}
