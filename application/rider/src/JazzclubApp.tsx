import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/JazzContent.tsx";
import { App, ConfigProvider, theme } from "antd";
import { createTokenBasedStyles, customColors } from "../../vue/src/app/createTokenBasedStyles.ts";
import "../../vue/src/app/JC-styles.css";
import locale_de from "antd/locale/de_DE";

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
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: customColors,
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
