import { NextFunction, Request, Response } from "express";
import User from "jc-shared/user/user.js";
import Accessrights from "jc-shared/user/accessrights.js";

function createCheckFor(question: keyof Accessrights) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!(req.user as User).accessrights[question]) {
      res.sendStatus(403);
      return;
    }
    next();
  };
}

export const checkSuperuser = createCheckFor("isSuperuser");
export const checkOrgateam = createCheckFor("isOrgaTeam");
export const checkAbendkasse = createCheckFor("isAbendkasse");

export async function checkCanEditUser(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.canEditUser(req.body.id)) {
    res.sendStatus(403);
    return;
  }
  next();
}
