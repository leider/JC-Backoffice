import express from "express";
import { ensureLoggedIn } from "connect-ensure-login";
const eLI = ensureLoggedIn("/login");
import store from "../users/userstore";
import User from "../../../shared/user/user";

export default function secureByLogin(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (/\/upload|ical|index.html/.test(req.originalUrl)) {
    return next();
  }

  const pathname = req.originalUrl;
  if (pathname.lastIndexOf(".") > pathname.lastIndexOf("/")) {
    // seems to be a file request
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(401).send();
      return;
    }
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
