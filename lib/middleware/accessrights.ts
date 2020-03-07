import express from "express";
import User from "../users/user";
import Accessrights from "../commons/accessrights";

export default function accessrights(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.locals.accessrights = {
    acc: new Accessrights(req.user as User),

    member: function member(): User {
      return this.acc.member;
    },

    memberId: function memberId(): string {
      return this.acc.memberId;
    },

    gruppen: function gruppen(): string[] {
      return this.acc.gruppen;
    },

    rechte: function rechte(): string[] {
      return this.acc.rechte;
    },

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

    darfKasseFreigeben: function darfKasseFreigeben(): boolean {
      return this.acc.darfKasseFreigeben;
    },

    canEditUser: function canEditUser(userid: string): boolean {
      return this.acc.canEditUser(userid);
    }
  };
  next();
}
