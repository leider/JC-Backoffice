import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Col, Layout, Row, theme } from "antd";
import { Link, useLocation } from "react-router-dom";
import { menuKeys } from "@/components/content/MenuNodes.tsx";
import { JazzContext, useCreateJazzContext } from "@/components/content/useJazzContext.ts";
import InnerContent from "@/components/content/InnerContent.tsx";
import { useProvideAuth } from "@/commons/auth.tsx";
import { AuthContext } from "@/commons/authConsts";
import { JazzHeader } from "@/components/content/JazzHeader.tsx";
import { TellUserToFillHelpFields } from "@/components/users/TellUserToFillHelpFields.tsx";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { useQuery } from "@tanstack/react-query";
import { konzerteForToday } from "@/commons/loader.ts";
import HelpContent from "@/components/content/HelpContent.tsx";

const { Content } = Layout;

function TodaysConcert() {
  const today = new DatumUhrzeit();
  const { data } = useQuery({
    queryKey: ["konzert", `${today.mitUhrzeitNumerisch}`],
    queryFn: () => konzerteForToday(),
  });

  const bestaetigte = useMemo(() => {
    return data?.filter((konz) => konz.kopf.confirmed);
  }, [data]);

  if (bestaetigte?.length ?? 0 > 0)
    return (
      <Row gutter={6} style={{ marginTop: 8 }}>
        <Col span={24}>
          {bestaetigte?.map((konzert) => (
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
    const result = Object.keys(menuKeys).find((key) => pathname.search(key) > 0);
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
