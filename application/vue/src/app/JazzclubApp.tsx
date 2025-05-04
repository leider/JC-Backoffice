import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/components/content/JazzContent.tsx";
import { App, ConfigProvider, theme } from "antd";
import "./JC-styles.css";
import locale_de from "antd/locale/de_DE";
import "numeral/locales/de";
import numeral from "numeral";
import useUpdateApp from "@/app/useUpdateApp.ts";
import React, { useEffect, useMemo, useState } from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { GlobalContext } from "@/app/GlobalContext.ts";
import useJazzPrefs, { JazzPrefs } from "@/app/useJazzPrefs.ts";
import useIsTouchScreen from "@/commons/useIsTouchScreen.ts";

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: (query) => (Date.now() - query.state.dataUpdatedAt) / (1000 * 60) > 10,
    },
  },
});

function JazzclubApp() {
  useUpdateApp();
  const isTouch = useIsTouchScreen();
  const { getPreferences } = useJazzPrefs();
  const [preferences, setPreferences] = useState<JazzPrefs>(getPreferences());
  const { xl } = useBreakpoint();

  const compactMode = useMemo(() => {
    const compactPref = preferences.compactPref;
    const normal = compactPref === "normal";
    if (normal) {
      return false;
    }
    const compact = compactPref === "compact";
    if (compact) {
      return true;
    }
    return !xl;
  }, [preferences.compactPref, xl]);
  const [darkModeFromDevice, setDarkModeFromDevice] = useState(darkModePreference.matches);

  const darkMode = useMemo(() => {
    const darkPref = preferences.darkPref;
    const dark = darkPref === "dark";
    if (dark) {
      return true;
    }
    const bright = darkPref === "bright";
    if (bright) {
      return false;
    }
    return darkModeFromDevice;
  }, [darkModeFromDevice, preferences.darkPref]);

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setDarkModeFromDevice(e?.matches);
    darkModePreference.addEventListener("change", listener);
    return () => darkModePreference.removeEventListener("change", listener);
  }, []);

  const [viewport, setViewport] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const listener = () => {
      setPreferences(getPreferences());
    };
    const resizeListener = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("storage", listener);
    window.addEventListener("resize", resizeListener);
    return () => {
      window.removeEventListener("storage", listener);
      window.removeEventListener("resize", resizeListener);
    };
  }, [getPreferences]);

  const success = "#28a745";
  numeral.localeData("de").delimiters.thousands = ".";
  numeral.locale("de");

  const algo = useMemo(() => {
    const result = [darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm];
    if (compactMode) {
      result.push(theme.compactAlgorithm);
    }
    return result;
  }, [darkMode, compactMode]);

  const colorBgBase = useMemo(() => (darkMode ? "#101010" : "#fafafa"), [darkMode]);
  const colorTextDisabled = useMemo(() => (darkMode ? "rgb(255,255,255,0.65)" : "rgb(0,0,0,0.65)"), [darkMode]);

  const initialContext = useMemo(
    () => ({ isDarkMode: darkMode, isCompactMode: compactMode, viewport, isTouch }),
    [compactMode, darkMode, viewport, isTouch],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        form={{
          validateMessages: { required: "Du musst einen Wert eingeben" },
        }}
        locale={locale_de}
        theme={{
          cssVar: true,
          hashed: false,
          token: {
            colorPrimary: "#337ab7",
            colorTextDisabled,
            colorLink: "#337ab7",
            borderRadius: 0,
            fontSize: 12,
            fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
            colorError: "#c71c2c",
            colorSuccess: success,
            colorLinkActive: "#2c4862",
            colorLinkHover: "#2c4862",
            linkHoverDecoration: "underline",
            colorBgBase,
          },
          algorithm: algo,
          components: {
            Button: { primaryShadow: "none" },
            Checkbox: { colorPrimary: success, colorPrimaryHover: success, colorPrimaryBorder: success },
            Collapse: { contentPadding: !xl ? 4 : 12 },
            Form: { itemMarginBottom: 12, verticalLabelPadding: 0 },
            Slider: { handleColor: colorTextDisabled },
            Table: { cellPaddingBlockSM: 0, cellPaddingInlineSM: 0 },
            Tag: { algorithm: theme.defaultAlgorithm },
          },
        }}
      >
        <App>
          <GlobalContext.Provider value={initialContext}>
            <JazzContent />
          </GlobalContext.Provider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default JazzclubApp;
