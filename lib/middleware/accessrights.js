module.exports = function accessrights(req, res, next) {
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

    isSuperuser: function isSuperuser() {
      return this.gruppen().includes('superusers');
    },

    isBookingTeam: function isBookingTeam() {
      return this.isSuperuser() || this.gruppen().includes('bookingTeam ');
    },

    isOrgaTeam: function isOrgaTeam() {
      return this.isSuperuser() || this.gruppen().includes('orgaTeam ');
    },

    hasSomeGroupAssigned: function hasSomeGroupAssigned() {
      return this.gruppen().length > 0;
    },

    canEditUser: function canEditUser(userid) {
      return this.memberId() === userid;
    }
  };
  next();
};
