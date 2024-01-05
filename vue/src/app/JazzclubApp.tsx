import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/components/content/JazzContent.tsx";
import { App, ConfigProvider, theme } from "antd";
import { createTokenBasedStyles, customColors } from "@/app/createTokenBasedStyles.ts";
import "./JC-styles.css";
import locale_de from "antd/locale/de_DE";
import "numeral/locales/de";
import numeral from "numeral";
import useUpdateApp from "@/app/useUpdateApp.ts";
import { AuthProvider } from "@/commons/auth.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function JazzclubApp() {
  useUpdateApp();
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
