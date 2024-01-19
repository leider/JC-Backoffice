import * as React from "react";
import { useEffect, useState } from "react";
import { Layout, theme } from "antd";
import { useLocation } from "react-router-dom";
import { menuKeys } from "@/components/content/MenuNodes.tsx";
import { JazzContext, useCreateJazzContext } from "@/components/content/useJazzContext.ts";
import InnerContent from "@/components/content/InnerContent.tsx";
import { useProvideAuth } from "@/commons/auth.tsx";
import { AuthContext } from "@/commons/authConsts";
import { JazzHeader } from "@/components/content/JazzHeader.tsx";
import { TellUserToFillHelpFields } from "@/components/users/TellUserToFillHelpFields.tsx";

const { Content } = Layout;

const JazzContent: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { pathname } = useLocation();
  const [activeElement, setActiveElement] = useState<string>("");
  const auth = useProvideAuth();
  const context = useCreateJazzContext(auth);

  useEffect(() => {
    const result = Object.keys(menuKeys).find((key) => pathname.search(key) > 0);
    if (pathname.search("preview") > 0) {
      return setActiveElement("team");
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
              <InnerContent />
            </div>
          </Content>
        </Layout>
      </JazzContext.Provider>
    </AuthContext.Provider>
  );
};

export default JazzContent;
