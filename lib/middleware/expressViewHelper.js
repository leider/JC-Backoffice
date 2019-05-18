const beans = require('simple-configure').get('beans');
const statusmessage = beans.get('statusmessage');
const fieldHelpers = beans.get('fieldHelpers');
const DatumUhrzeit = beans.get('DatumUhrzeit');

function gruppenUndRechteText(user) {
  const tokens = user.rechte ? user.gruppen.concat(user.rechte) : user.gruppen;
  if (tokens.length > 0) {
    return tokens
      .map(gruppe => gruppe.substring(0, 1).toLocaleUpperCase())
      .join(', ');
  }
  return '-';
}

module.exports = function expressViewHelper(req, res, next) {
  if (req.session) {
    if (req.session.statusmessage) {
      statusmessage
        .fromObject(req.session.statusmessage)
        .putIntoSession(req, res);
    }
  }
  res.locals.user = req.user;
  res.locals.currentUrl = req.url;
  res.locals.formatReadonlyAsEuro = number => {
    return fieldHelpers.formatNumberTwoDigits(number) + ' €';
  };
  res.locals.formatNumberTwoDigitsEnglish =
    fieldHelpers.formatNumberTwoDigitsEnglish;
  res.locals.gruppenUndRechteText = gruppenUndRechteText;
  res.locals.cssColorCode = fieldHelpers.cssColorCode;
  res.locals.cssIconClass = fieldHelpers.cssIconClass;
  res.locals.DatumUhrzeit = DatumUhrzeit;
  next();
};
