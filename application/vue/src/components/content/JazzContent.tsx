import * as React from "react";
import { useEffect, useState } from "react";
import { Layout, theme } from "antd";
import { useLocation } from "react-router";
import { menuKeys } from "@/components/content/menu/MenuNodes.tsx";
import { JazzContext, useCreateJazzContext } from "@/components/content/useJazzContext.ts";
import InnerContent from "@/components/content/InnerContent.tsx";
import { useProvideAuth } from "@/commons/auth.tsx";
import { AuthContext } from "@/commons/authConsts";
import { JazzHeader } from "@/components/content/menu/JazzHeader.tsx";
import { TellUserToFillHelpFields } from "@/components/users/TellUserToFillHelpFields.tsx";
import HelpContent from "@/components/content/HelpContent.tsx";
import find from "lodash/find";
import keys from "lodash/keys";
import TodaysConcert from "@/components/content/TodaysConcert.tsx";

const { Content } = Layout;

export default function JazzContent() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { pathname } = useLocation();
  const [activeElement, setActiveElement] = useState<string>("");
  const auth = useProvideAuth();
  const context = useCreateJazzContext(auth);

  useEffect(() => {
    const result = find(keys(menuKeys), (key) => pathname.search(key) > 0);
    if (pathname.search("preview") > 0) {
      return setActiveElement("team");
    }
    if (pathname.search("vermietung|konzert") > 0) {
      return setActiveElement("veranstaltung");
    }
    setActiveElement(result || "");
  }, [pathname]);

  return (
    <AuthContext.Provider value={auth}>
      <JazzContext.Provider value={context}>
        <Layout>
          <JazzHeader activeElement={activeElement} />
          <Content style={{ minHeight: "calc(100vh - 65px)" }}>
            <div style={{ background: colorBgContainer }}>
              <TellUserToFillHelpFields />
              <TodaysConcert />
              <InnerContent />
            </div>
          </Content>
          <HelpContent />
        </Layout>
      </JazzContext.Provider>
    </AuthContext.Provider>
  );
}
