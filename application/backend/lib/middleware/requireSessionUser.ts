import type { NextFunction, Request, Response } from "express";
import userstore from "../users/userstore.js";

/**
 * Populates req.user from the signed session cookie (user id). Responds 401 if missing or unknown user.
 */
export default function requireSessionUser(req: Request, res: Response, next: NextFunction): void {
  const userId = req.session.userId;
  if (!userId) {
    res.sendStatus(401);
    return;
  }
  const user = userstore.forId(userId);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  req.user = user;
  next();
}
