import express from 'express';
import { ensureLoggedIn } from 'connect-ensure-login';
const eLI = ensureLoggedIn('/login');
import store from '../users/userstore';
import User from '../users/user';

export default function secureByLogin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  if (/\/upload|ical/.test(req.originalUrl)) {
    return next();
  }
  return store.allUsers((err: Error | null, users: User[]) => {
    if (err) {
      return next(err);
    }
    if (users && users.length && !/\/login/.test(req.originalUrl)) {
      return eLI(req, res, next);
    }
    return next();
  });
}
