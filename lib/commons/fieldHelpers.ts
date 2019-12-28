const cssMap: { [index: string]: { color: string; icon: string } } = {
  Soulcafé: { color: 'soulcafe', icon: 'flaticon-play text-soulcafe' },
  JazzClassix: { color: 'classix', icon: 'flaticon-music-1 text-classix' },
  JamSession: { color: 'session', icon: 'flaticon-people text-session' },
  JazzFestival: { color: 'festival', icon: 'flaticon-shapes text-festival' }
};

export default {
  formatNumberTwoDigits: function formatNumberTwoDigits(number: string | number) {
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

  formatNumberTwoDigitsEnglish: function formatNumberTwoDigitsEnglish(
    number: string | number
  ) {
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

  parseNumberWithCurrentLocale: function parseNumberWithCurrentLocale(
    numberString: string
  ) {
    return parseFloat(numberString.replace('.', '').replace(',', '.'));
  },

  cssColorCode: function cssColorCode(typ: string) {
    return ((cssMap[typ] as { color: string }) || { color: 'concert' }).color;
  },

  cssIconClass: function cssIconClass(typ: string) {
    return (cssMap[typ] || { icon: 'flaticon-null text-concert' }).icon;
  }
};
