import { NextFunction, Request, Response } from "express";
import User from "jc-shared/user/user.js";

export async function checkSuperuser(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.isSuperuser) {
    return res.sendStatus(403);
  }
  next();
}

export async function checkOrgateam(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.isOrgaTeam) {
    return res.sendStatus(403);
  }
  next();
}

export async function checkCanEditUser(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.canEditUser(req.body.id)) {
    return res.sendStatus(403);
  }
  next();
}

export async function checkAbendkasse(req: Request, res: Response, next: NextFunction) {
  if (!(req.user as User).accessrights.isAbendkasse) {
    return res.sendStatus(403);
  }
  next();
}
