import { useEffect } from "react";
import OptionValues, { colorVermietung } from "jc-shared/optionen/optionValues.ts";
import forEach from "lodash/forEach";
import tinycolor from "tinycolor2";
import misc from "jc-shared/commons/misc.ts";

function colorText({ color, darkMode, ghost }: { color: string; darkMode: boolean; ghost: boolean }): string {
  const lightText = darkMode ? "#dcdcdc" : "#ffffff";
  const darkText = darkMode ? "#666666" : "#111111";

  if (ghost) {
    const lightGhost = tinycolor(lightText).darken().toHexString();
    const darkGhost = tinycolor(darkText).lighten(40).toHexString();
    const ghostColor = tinycolor(color).brighten(5).toHexString();
    return tinycolor.readability(ghostColor, lightGhost) > 2 ? lightGhost : darkGhost;
  }
  return tinycolor.readability(color, lightText) > 2 ? lightText : darkText;
}

function createVars(typenPlus: { name: string; color: string }[], isDarkMode: boolean) {
  const fakeTypVermietung: {
    name: string;
    color: string;
  } = {
    name: "vermietung",
    color: colorVermietung,
  };
  forEach([...typenPlus, fakeTypVermietung], (type) => {
    const qualifier = misc.normalizeString(type.name);
    const cssVars: { [key: string]: string } = {};
    cssVars[`--jazz-${qualifier}-text-color`] = colorText({ color: type.color, darkMode: isDarkMode, ghost: false });
    cssVars[`--jazz-${qualifier}-text-color-ghost`] = colorText({ color: type.color, darkMode: isDarkMode, ghost: true });
    cssVars[`--jazz-${qualifier}-color`] = type.color;
    cssVars[`--jazz-${qualifier}-color-ghost`] = tinycolor(type.color).brighten(5).toHexString();
    for (const [key, value] of Object.entries(cssVars)) {
      document.documentElement.style.setProperty(key, value);
    }
  });
  document.documentElement.style.setProperty("--jazz-global-bright-text", isDarkMode ? "#dcdcdc" : "#fff");
}

export default function useCreateCssVars({ optionen, isDarkMode }: { optionen: OptionValues; isDarkMode: boolean }) {
  useEffect(() => {
    createVars(optionen.typenPlus, isDarkMode);
  }, [optionen, isDarkMode]);
}
