const cssMap: { [index: string]: { color: string; icon: string } } = {
  Soulcafé: { color: "soulcafe", icon: "flaticon-play text-soulcafe" },
  JazzClassix: { color: "classix", icon: "flaticon-music-1 text-classix" },
  JamSession: { color: "session", icon: "flaticon-people text-session" },
  JazzFestival: { color: "festival", icon: "flaticon-shapes text-festival" },
  Kooperation: { color: "kooperation", icon: "flaticon-shapes text-kooperation" },
  Livestream: { color: "livestream", icon: "flaticon-shapes text-livestream" },
};

export default {
  formatNumberTwoDigits: function formatNumberTwoDigits(number: string | number): string {
    if (typeof number === "string") {
      return number;
    }
    if (number !== 0 && !number) {
      return "";
    }
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(number || 0);
  },

  formatNumberTwoDigitsEnglish: function formatNumberTwoDigitsEnglish(number: string | number): string {
    if (typeof number === "string") {
      return number;
    }
    if (number !== 0 && !number) {
      return "";
    }
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: false,
    }).format(number || 0);
  },

  parseNumberWithCurrentLocale: function parseNumberWithCurrentLocale(numberString: string): number {
    return parseFloat(numberString.replace(".", "").replace(",", "."));
  },

  cssColorCode: function cssColorCode(typ: string): string {
    return ((cssMap[typ] as { color: string }) || { color: "concert" }).color;
  },

  cssIconClass: function cssIconClass(typ: string): string {
    return (cssMap[typ] || { icon: "flaticon-null text-concert" }).icon;
  },
};
