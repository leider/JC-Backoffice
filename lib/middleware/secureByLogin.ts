import express from 'express';
import { ensureLoggedIn } from 'connect-ensure-login';
const eLI = ensureLoggedIn('/login');
import store from '../users/userstore';

export default function secureByLogin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (/\/upload|ical/.test(req.originalUrl)) {
    return next();
  }
  store.allUsers((err: Error | null, users: any) => {
    if (err) {
      return next(err);
    }
    if (users && users.length && !/\/login/.test(req.originalUrl)) {
      return eLI(req, res, next);
    }
    next();
  });
};
