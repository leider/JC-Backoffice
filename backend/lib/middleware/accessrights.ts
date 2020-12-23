import express from "express";
import User from "jc-shared/user/user";
import Accessrights from "jc-shared/user/accessrights";

export default function accessrights(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.locals.accessrights = {
    acc: new Accessrights(req.user as User),

    isSuperuser: function isSuperuser(): boolean {
      return this.acc.isSuperuser;
    },

    isBookingTeam: function isBookingTeam(): boolean {
      return this.acc.isBookingTeam;
    },

    isOrgaTeam: function isOrgaTeam(): boolean {
      return this.acc.isOrgaTeam;
    },

    isAbendkasse: function isAbendkasse(): boolean {
      return this.acc.isAbendkasse;
    },

    canEditUser: function canEditUser(userid: string): boolean {
      return this.acc.canEditUser(userid);
    },
  };
  next();
}
