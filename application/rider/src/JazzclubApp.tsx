import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/JazzContent.tsx";
import { App, ConfigProvider, theme } from "antd";
import "../../vue/src/app/JC-styles.css";
import locale_de from "antd/locale/de_DE";
import { useState } from "react";

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function JazzclubApp() {
  const [darkMode, setDarkMode] = useState(darkModePreference.matches);
  darkModePreference.addEventListener("change", (e) => setDarkMode(e.matches));
  const success = "#28a745";
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
