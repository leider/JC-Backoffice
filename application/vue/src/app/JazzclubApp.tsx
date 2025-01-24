import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/components/content/JazzContent.tsx";
import { App, ConfigProvider, theme } from "antd";
import "./JC-styles.css";
import locale_de from "antd/locale/de_DE";
import "numeral/locales/de";
import numeral from "numeral";
import useUpdateApp from "@/app/useUpdateApp.ts";
import React, { useMemo, useState } from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { GlobalContext } from "@/app/GlobalContext.ts";

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
  const { xl } = useBreakpoint();
  const compactMode = useMemo(() => !xl, [xl]);
  const [darkMode, setDarkMode] = useState(darkModePreference.matches);
  darkModePreference.addEventListener("change", (e) => setDarkMode(e.matches));
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

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#337ab7",
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
            Checkbox: { colorPrimary: success, colorPrimaryHover: success, colorPrimaryBorder: success },
            Tag: { algorithm: theme.defaultAlgorithm },
            Collapse: { contentPadding: !xl ? 4 : 12 },
            Form: { itemMarginBottom: 12 },
          },
        }}
        locale={locale_de}
        form={{
          validateMessages: { required: "Du musst einen Wert eingeben" },
        }}
      >
        <App>
          <GlobalContext.Provider value={{ isDarkMode: darkMode, isCompactMode: compactMode }}>
            <JazzContent />
          </GlobalContext.Provider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default JazzclubApp;
