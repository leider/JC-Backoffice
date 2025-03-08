import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RiderContent from "@/RiderContent.tsx";
import { App, ConfigProvider, theme } from "antd";
import "../../vue/src/app/JC-styles.css";
import locale_de from "antd/locale/de_DE";
import { useState } from "react";
import { DefaultGlobalContext, GlobalContext } from "jc-vue/src/app/GlobalContext";

const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function RiderApp() {
  const [darkMode, setDarkMode] = useState(darkModePreference.matches);
  darkModePreference.addEventListener("change", (e) => setDarkMode(e.matches));
  const success = "#28a745";
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        form={{
          validateMessages: { required: "Du musst einen Wert eingeben" },
        }}
        locale={locale_de}
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
      >
        <App>
          <GlobalContext.Provider value={DefaultGlobalContext}>
            <RiderContent />
          </GlobalContext.Provider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default RiderApp;
