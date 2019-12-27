import express from 'express';

export default function passportSessionInitializer(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore
  const passport = req._passport.instance;

  if (req.session && req.session[passport._key]) {
    // load data from existing session
    // @ts-ignore
    req._passport.session = req.session[passport._key];
  } else if (req.session) {
    // initialize new session
    req.session[passport._key] = {};
    // @ts-ignore
    req._passport.session = req.session[passport._key];
  } else {
    // no session is available
    // @ts-ignore
    req._passport.session = {};
  }

  next();
}
