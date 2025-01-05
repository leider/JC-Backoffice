import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/JazzContent.tsx";
import { App, ConfigProvider } from "antd";
import "../../vue/src/app/JC-styles.css";
import locale_de from "antd/locale/de_DE";
import { customColors } from "jc-vue/src/app/customColors.ts";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function JazzclubApp() {
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
