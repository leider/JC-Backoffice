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

    isSuperuser: function isSuperuser() {
      return config.get('superusers').includes(this.memberId());
    },

    isBookingTeam: function isBookingTeam() {
      return this.isSuperuser() || config.get('bookingTeam').includes(this.memberId());
    }
  };
  next();
};
