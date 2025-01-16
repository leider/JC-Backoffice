import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/components/content/JazzContent.tsx";
import { App, ConfigProvider, theme } from "antd";
import "./JC-styles.css";
import locale_de from "antd/locale/de_DE";
import "numeral/locales/de";
import numeral from "numeral";
import useUpdateApp from "@/app/useUpdateApp.ts";
import React, { useState } from "react";
import { customColors } from "@/app/customColors.ts";

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
  const [darkMode, setDarkMode] = useState(darkModePreference.matches);
  darkModePreference.addEventListener("change", (e) => setDarkMode(e.matches));
  const success = "#28a745";
  numeral.localeData("de").delimiters.thousands = ".";
  numeral.locale("de");
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#337ab7",
            colorLink: "#337ab7",
            colorTextDisabled: darkMode ? undefined : "#333333",
            borderRadius: 0,
            fontSize: 12,
            fontFamily: "Montserrat, Helvetica, Arial, sans-serif",
            colorError: "#c71c2c",
            colorSuccess: success,
            colorLinkActive: "#2c4862",
            colorLinkHover: "#2c4862",
            linkHoverDecoration: "underline",
            colorBgBase: darkMode ? "#101010" : "#fafafa",
          },
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
          components: {
            Checkbox: { colorPrimary: success, colorPrimaryHover: success },
            Tag: { algorithm: theme.defaultAlgorithm },
          },
        }}
        locale={locale_de}
        form={{
          validateMessages: { required: "Du musst einen Wert eingeben" },
        }}
      >
        <App>
          <JazzContent />
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default JazzclubApp;
