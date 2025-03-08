import * as React from "react";
import { Layout, theme } from "antd";
import { RiderStandalone } from "@/RiderStandalone.tsx";

const { Header, Content } = Layout;

export default function RiderContent() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  return (
    <Layout>
      <Header style={{ position: "sticky", top: 0, zIndex: 1, width: "100%", paddingInline: "20px" }}>
        <div style={{ float: "left", width: "540px", height: "40px", margin: "12px 12px 0px 0px" }}>
          <img alt="Jazzclub Logo" src="/rider/img/logo_weiss.png" />
        </div>
      </Header>

      <Content style={{ minHeight: "calc(100vh - 65px)" }}>
        <div style={{ background: colorBgContainer }}>
          <RiderStandalone />
        </div>
      </Content>
    </Layout>
  );
}
