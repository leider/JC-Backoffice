import { NextFunction, Request, Response } from "express";
import User from "jc-shared/user/user.js";

export async function checkSuperuser(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.isSuperuser) {
    res.sendStatus(403);
    return;
  }
  next();
}

export async function checkOrgateam(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.isOrgaTeam) {
    res.sendStatus(403);
    return;
  }
  next();
}

export async function checkCanEditUser(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.canEditUser(req.body.id)) {
    res.sendStatus(403);
    return;
  }
  next();
}

export async function checkAbendkasse(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.isAbendkasse) {
    res.sendStatus(403);
    return;
  }
  next();
}
