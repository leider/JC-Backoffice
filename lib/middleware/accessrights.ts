import express from 'express';

export default function accessrights(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.locals.accessrights = {
    req,

    member: function member() {
      return this.req.user;
    },

    memberId: function memberId() {
      return this.member().id;
    },

    gruppen: function gruppen() {
      return this.member().gruppen || [];
    },

    rechte: function rechte() {
      return this.member().rechte || [];
    },

    isSuperuser: function isSuperuser() {
      return this.gruppen().includes('superusers');
    },

    isBookingTeam: function isBookingTeam() {
      return this.isSuperuser() || this.gruppen().includes('bookingTeam');
    },

    isOrgaTeam: function isOrgaTeam() {
      return this.isBookingTeam() || this.gruppen().includes('orgaTeam');
    },

    isAbendkasse: function isAbendkasse() {
      return (
        this.isSuperuser() ||
        this.isOrgaTeam() ||
        this.gruppen().includes('abendkasse')
      );
    },

    darfKasseFreigeben: function darfKasseFreigeben() {
      return this.isSuperuser() || this.rechte().includes('kassenfreigabe');
    },

    canEditUser: function canEditUser(userid: string) {
      return this.isSuperuser() || this.memberId() === userid;
    }
  };
  next();
};
