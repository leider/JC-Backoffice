const conf = require('simple-configure');
import expressSession from 'express-session';
const sevenDays = 86400 * 1000 * 7;
const oneHour = 3600;

let sessionStore;

if (!conf.get('dontUsePersistentSessions')) {
  const MongoStore = require('connect-mongo')(expressSession);
  sessionStore = new MongoStore({
    url: conf.get('mongoURL'),
    touchAfter: oneHour,
    mongoOptions: { useNewUrlParser: true, useUnifiedTopology: true }
  });
}

export default expressSession({
  secret: conf.get('secret'),
  cookie: { maxAge: sevenDays },
  store: sessionStore,
  resave: false,
  saveUninitialized: false
});
