import * as React from "react";
import { Layout, Menu, theme } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoginState, useAuth } from "@/commons/auth";

const { Header, Content } = Layout;

const JazzContent: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { loginState } = useAuth();
  const { pathname, search } = useLocation();

  return (
    <Layout className="layout">
      <Header style={{ position: "sticky", top: 0, zIndex: 1, width: "100%" }}>
        <div
          style={{
            float: "left",
            width: 120,
            height: 31,
            margin: "16px 24px 16px 0",
            background: "rgba(255, 255, 255, 0.2)",
          }}
        />
        <div className="logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={["2"]}
          items={new Array(15).fill(null).map((_, index) => {
            const key = index + 1;
            return {
              key,
              label: `nav ${key}`,
            };
          })}
        />
      </Header>

      <Content style={{ padding: "5px 5px" }}>
        <div style={{ background: colorBgContainer }}>
          <InnerContent pathname={pathname} loginState={loginState} search={search} />
        </div>
      </Content>
    </Layout>
  );
};

function InnerContent(props: { pathname: string; loginState: LoginState; search: string }) {
  if (props.pathname !== "/login" && props.loginState !== LoginState.LOGGED_IN) {
    return (
      <Navigate
        to={{
          pathname: "/login",
          search: encodeURIComponent(props.pathname + (props.search ? props.search : "")),
        }}
      />
    );
  } else {
    return <Outlet />;
  }
}
export default JazzContent;
