import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import JazzContent from "@/components/JazzContent";
import { ConfigProvider, GlobalToken, theme } from "antd";
import createTokenBasedStyles from "@/components/createTokenBasedStyles";
import { AuthProvider } from "@/commons/auth";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

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
    concert: token.colorTextSecondary,
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
  result.colorPrimary = "#a01441";
  result.colorTextDisabled = "#333333";
  result.borderRadius = 2;
  result.fontSize = 14;

  return result;
}

function JazzclubApp() {
  const { token } = useToken();
  createTokenBasedStyles(document, token);
  const jcToken = createTokenWithCustomColors(token);
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          hashed: false,
          token: jcToken,
        }}
      >
        <AuthProvider>
          <JazzContent />
        </AuthProvider>
      </ConfigProvider>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default JazzclubApp;
