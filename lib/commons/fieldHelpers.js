/* eslint no-underscore-dangle: 0 */

const cssMap = {
  'Soulcafé': {color: 'soulcafe', icon: 'flaticon-play text-soulcafe'},
  'JazzClassix': {color: 'classix', icon: 'flaticon-music-1 text-classix'},
  'JamSession': {color: 'session', icon: 'flaticon-people text-session'},
  'JazzFestival': {color: 'festival', icon: 'flaticon-shapes text-festival'}
};

module.exports = {
  replaceMailAddresses: function replaceMailAddresses(text) {
    if (text) {
      return text.replace(/[\w.-]+@[\w.-]+\.[\w.-]{2,3}(?!\w)/g, '...@...');
      // this means: some chars @ some chars . 2 or 3 chars, not followed by a char
      // where char = a-z A-Z 0-9 _ . -
    }
    return text;
  },

  replaceLongNumbers: function replaceLongNumbers(text) {
    if (text) {
      return text.replace(/[-+()/\d][-()/\d\s]{4,}[-()/\d]/g, '...');
      // this means: first we need a number or + or - or ( or ) or /
      // then we need the same or space, at least four times
      // last we need a number or - or ( or ) or /
    }
    return text;
  },

  killHtmlHead: function killHtmlHead(text) {
    if (text) {
      return text.replace(/<head>(?:\S|\s|\r)*<\/head>/, '');
    }
    return text;
  },

  formatNumberWithCurrentLocale: function formatNumberWithCurrentLocale(res, number) {
    return new Intl.NumberFormat(res.locals.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number || 0);
  },

  formatNumberTwoDigits: function formatNumberTwoDigits(number) {
    if (typeof number === 'string') {
      return number;
    }
    if (number !== 0 && !number) {
      return '';
    }
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false
    }).format(number || 0);
  },

  formatNumberTwoDigitsEnglish: function formatNumberTwoDigitsEnglish(number) {
    if (typeof number === 'string') {
      return number;
    }
    if (number !== 0 && !number) {
      return '';
    }
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false
    }).format(number || 0);
  },

  parseNumberWithCurrentLocale: function parseNumberWithCurrentLocale(numberString) {
    if (!numberString && numberString !== 0) {
      return null;
    }
    return parseFloat(numberString.replace('.', '').replace(',', '.'));
  },

  containsSlash: function containsSlash(string) {
    return (/\//).test(string);
  },

  cssColorCode: function cssColorCode(typ) {
    return (cssMap[typ] || {color: 'concert'}).color;
  },

  cssIconClass: function cssIconClass(typ) {
    return (cssMap[typ] || {icon: 'flaticon-null text-concert'}).icon;
  }

};
