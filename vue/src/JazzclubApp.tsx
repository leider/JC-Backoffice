import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/components/JazzContent";
import { App, ConfigProvider, theme } from "antd";
import { createTokenBasedStyles, customColors } from "@/components/createTokenBasedStyles";
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

function JazzclubApp() {
  const { useToken } = theme;
  const { token } = useToken();

  createTokenBasedStyles(document, token);
  numeral.localeData("de").delimiters.thousands = ".";
  numeral.locale("de");
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: customColors,
          components: {
            Checkbox: {
              colorPrimary: customColors.colorSuccess as string,
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
