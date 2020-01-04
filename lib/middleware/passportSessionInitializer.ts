import express from "express";

export default function passportSessionInitializer(req: any, res: express.Response, next: express.NextFunction): void {
  /* eslint no-underscore-dangle: 0 */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    req._passport.session = {};
  }

  next();
}
