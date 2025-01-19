import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Col, Layout, Row, theme } from "antd";
import { Link, useLocation } from "react-router";
import { menuKeys } from "@/components/content/menu/MenuNodes.tsx";
import { JazzContext, useCreateJazzContext, useJazzContext } from "@/components/content/useJazzContext.ts";
import InnerContent from "@/components/content/InnerContent.tsx";
import { useProvideAuth } from "@/commons/auth.tsx";
import { AuthContext } from "@/commons/authConsts";
import { JazzHeader } from "@/components/content/menu/JazzHeader.tsx";
import { TellUserToFillHelpFields } from "@/components/users/TellUserToFillHelpFields.tsx";
import HelpContent from "@/components/content/HelpContent.tsx";
import find from "lodash/find";
import map from "lodash/map";
import filter from "lodash/filter";
import keys from "lodash/keys";

const { Content } = Layout;

function TodaysConcert() {
  const { todayKonzerte } = useJazzContext();
  const bestaetigte = useMemo(() => filter(todayKonzerte, "kopf.confirmed"), [todayKonzerte]);

  if (bestaetigte?.length ?? 0 > 0)
    return (
      <Row gutter={6} style={{ marginTop: 8 }}>
        <Col span={24}>
          {map(bestaetigte, (konzert) => (
            <Link key={konzert.fullyQualifiedPreviewUrl} to={konzert.fullyQualifiedPreviewUrl} style={{ color: "#FFF" }}>
              <h2
                style={{
                  marginBottom: 0,
                  marginTop: 0,
                  textAlign: "center",
                  backgroundColor: konzert.color,
                  textDecoration: konzert.kopf.abgesagt ? "line-through" : "",
                }}
              >
                {konzert.startDatumUhrzeit.wochentagUhrzeitKompakt}: {konzert.kopf.titel}
              </h2>
            </Link>
          ))}
        </Col>
      </Row>
    );
}
const JazzContent: React.FC = () => {
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
};

export default JazzContent;
