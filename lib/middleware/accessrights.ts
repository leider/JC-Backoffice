import express from "express";
import User from "../users/user";

export default function accessrights(req: express.Request, res: express.Response, next: express.NextFunction): void {
  res.locals.accessrights = {
    req,

    member: function member(): User {
      return this.req.user;
    },

    memberId: function memberId(): string {
      return this.member().id;
    },

    gruppen: function gruppen(): string[] {
      return this.member().gruppen || [];
    },

    rechte: function rechte(): string[] {
      return this.member().rechte || [];
    },

    isSuperuser: function isSuperuser(): boolean {
      return this.gruppen().includes("superusers");
    },

    isBookingTeam: function isBookingTeam(): boolean {
      return this.isSuperuser() || this.gruppen().includes("bookingTeam");
    },

    isOrgaTeam: function isOrgaTeam(): boolean {
      return this.isBookingTeam() || this.gruppen().includes("orgaTeam");
    },

    isAbendkasse: function isAbendkasse(): boolean {
      return this.isSuperuser() || this.isOrgaTeam() || this.gruppen().includes("abendkasse");
    },

    darfKasseFreigeben: function darfKasseFreigeben(): boolean {
      return this.isSuperuser() || this.rechte().includes("kassenfreigabe");
    },

    canEditUser: function canEditUser(userid: string): boolean {
      return this.isSuperuser() || this.memberId() === userid;
    }
  };
  next();
}
