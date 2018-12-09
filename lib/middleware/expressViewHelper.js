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
    if (number !== 0 && !number) {
      return '';
    }
    return fieldHelpers.formatNumberTwoDigits(number) + ' €';
  };
  res.locals.formatNumberTwoDigits = fieldHelpers.formatNumberTwoDigits;
  res.locals.gruppenUndRechteText = function gruppenUndRechteText(user) {
    const tokens = user.rechte ? user.gruppen.concat(user.rechte) : user.gruppen;
    if (tokens.length > 0) {
      return tokens.map(gruppe => gruppe.substring(0, 1).toLocaleUpperCase()).join(', ');
    }
    return '-';
  };
  next();
};
