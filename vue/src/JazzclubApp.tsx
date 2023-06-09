import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/components/JazzContent";
import { App, ConfigProvider, GlobalToken, theme } from "antd";
import createTokenBasedStyles from "@/components/createTokenBasedStyles";
import { AuthProvider } from "@/commons/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "./JC-styles.css";
import "./flaticon-patched.css";
import locale_de from "antd/locale/de_DE";
import "numeral/locales/de";
import numeral from "numeral";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});
const { useToken } = theme;

function createTokenWithCustomColors(token: GlobalToken) {
  const color = {
    ausgaben1: "#d50f36",
    kasse1: "#9185be",
    allgemein1: "#05498c",
    hotel1: "#66267b",
    sonst1: "#009285",
    ausgaben2: "#f07f31",
    kasse2: "#dea71f",
    allgemein2: "#4faee3",
    hotel2: "#e50069",
    sonst2: "#95c22e",
    festival: "#9fc442",
    livestream: "#ff29ac",
  };
  const jc_colors: { [index: string]: string | number } = {
    classix: color.allgemein2,
    concert: "#6c757d",
    kooperation: color.kasse1,
    ausgaben: color.ausgaben1,
    kalkulation: color.ausgaben1,
    festival: color.festival,
    allgemeines: color.allgemein1,
    hotel: color.hotel1,
    kasse: color.kasse1,
    technik: color.sonst1,
    presse: color.sonst2,
    session: color.kasse2,
    soulcafe: color.ausgaben2,
    staff: color.kasse2,
    copy: token.colorFillSecondary,
    livestream: color.livestream,
  };
  const result: { [index: string]: string | number } = {};
  Object.keys(jc_colors).forEach((key) => {
    result[`custom-color-${key}`] = jc_colors[key];
  });
  result.colorPrimary = "#337ab7";
  result.colorTextDisabled = "#333333";
  result.borderRadius = 0;
  result.fontSize = 12;
  result.fontFamily = "Montserrat, Helvetica, Arial, sans-serif;";
  result.colorError = "#c71c2c";
  result.colorSuccess = "#28a745";
  result.colorLink = result.colorPrimary;
  result.colorLinkActive = "#2c4862";
  result.colorLinkHover = "#2c4862";
  result.linkHoverDecoration = "underline";

  return result;
}

function JazzclubApp() {
  const { token } = useToken();
  const jcToken = createTokenWithCustomColors(token);
  createTokenBasedStyles(document, jcToken);
  numeral.localeData("de").delimiters.thousands = ".";
  numeral.locale("de");

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: jcToken,
          components: {
            Checkbox: {
              colorPrimary: jcToken.colorSuccess as string,
            },
          },
        }}
        locale={locale_de}
      >
        <App>
          <AuthProvider>
            <JazzContent />
          </AuthProvider>
        </App>
      </ConfigProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default JazzclubApp;
