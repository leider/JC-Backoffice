import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/components/JazzContent";
import { App, ConfigProvider, GlobalToken, theme } from "antd";
import { createTokenBasedStyles, veranstaltungTypeColors } from "@/components/createTokenBasedStyles";
import { AuthProvider } from "@/commons/auth";
import "./JC-styles.css";
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
  const jc_colors: { [index: string]: string } = {
    allgemeines: "#05498c",
    ausgaben: "#d50f36",
    copy: token.colorFillSecondary,
    hotel: "#66267b",
    kalkulation: "#d50f36",
    kasse: "#9185be",
    presse: "#95c22e",
    staff: "#dea71f",
    technik: "#009285",
  };
  const result: { [index: string]: string | number } = {};
  Object.keys(jc_colors).forEach((key) => {
    result[`custom-color-${key}`] = jc_colors[key];
  });
  Object.keys(veranstaltungTypeColors).forEach((key) => {
    result[`custom-color-${key}`] = veranstaltungTypeColors[key];
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
        form={{
          validateMessages: { required: "Du musst einen Wert eingeben" },
        }}
      >
        <App>
          <AuthProvider>
            <JazzContent />
          </AuthProvider>
        </App>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default JazzclubApp;
