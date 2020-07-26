import express from "express";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function passportSessionInitializer(req: any, res: express.Response, next: express.NextFunction): void {
  /* eslint no-underscore-dangle: 0 */
  const passport = req._passport.instance;

  if (req.session && req.session[passport._key]) {
    // load data from existing session
    req._passport.session = req.session[passport._key];
  } else if (req.session) {
    // initialize new session
    req.session[passport._key] = {};
    req._passport.session = req.session[passport._key];
  } else {
    // no session is available
    req._passport.session = {};
  }

  next();
}
