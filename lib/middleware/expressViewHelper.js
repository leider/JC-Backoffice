const beans = require('simple-configure').get('beans');
const statusmessage = beans.get('statusmessage');
const fieldHelpers = beans.get('fieldHelpers');

module.exports = function expressViewHelper(req, res, next) {
  res.locals.language = 'de';
  if (req.session) {
    res.locals.calViewYear = req.session.calViewYear;
    res.locals.calViewMonth = req.session.calViewMonth;
    if (req.session.statusmessage) {
      statusmessage.fromObject(req.session.statusmessage).putIntoSession(req, res);
    }
    res.locals.language = req.session.language || 'de';
  }
  res.locals.user = req.user;
  res.locals.currentUrl = req.url;
  res.locals.formatReadonlyAsEuro = number => {
    return fieldHelpers.formatNumberTwoDigits(number) + ' €';
  };
  res.locals.formatNumberTwoDigits = fieldHelpers.formatNumberTwoDigits;
  next();
};
