const moment = require('moment-timezone');
const beans = require('simple-configure').get('beans');
const statusmessage = beans.get('statusmessage');
const fieldHelpers = beans.get('fieldHelpers');

module.exports = function expressViewHelper(req, res, next) {
  if (req.session) {
    if (req.session.statusmessage) {
      statusmessage.fromObject(req.session.statusmessage).putIntoSession(req, res);
    }
  }
  res.locals.moment = moment;
  res.locals.user = req.user;
  res.locals.currentUrl = req.url;
  res.locals.formatReadonlyAsEuro = number => {
    return fieldHelpers.formatNumberTwoDigits(number) + ' €';
  };
  res.locals.formatNumberTwoDigits = fieldHelpers.formatNumberTwoDigits;
  next();
};
