const config = require('simple-configure');

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
      return this.gruppen().includes('superusers') || config.get('superusers').includes(this.memberId());
    },

    isBookingTeam: function isBookingTeam() {
      return this.isSuperuser() || this.gruppen().includes('bookingTeam ') || config.get('bookingTeam').includes(this.memberId());
    }
  };
  next();
};
