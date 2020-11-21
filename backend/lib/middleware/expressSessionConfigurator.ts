import conf from "../commons/simpleConfigure";
import expressSession from "express-session";
import connectMongo from "connect-mongo";
const sevenDays = 86400 * 1000 * 7;
const oneHour = 3600;

let sessionStore;

if (!conf.get("dontUsePersistentSessions")) {
  const MongoStore = connectMongo(expressSession);
  sessionStore = new MongoStore({
    url: conf.get("mongoURL") as string,
    touchAfter: oneHour,
    mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true },
  });
}

export default expressSession({
  secret: conf.get("secret") as string,
  cookie: { maxAge: sevenDays },
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
});
