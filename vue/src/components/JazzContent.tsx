import * as React from "react";
import { Layout, Menu, theme } from "antd";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoginState, useAuth } from "@/commons/auth";
import { useEffect } from "react";

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

      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content" style={{ background: colorBgContainer }}>
          {pathname !== "/login" && loginState !== LoginState.LOGGED_IN ? (
            <Navigate
              to={{
                pathname: "/login",
                search: encodeURIComponent(pathname + (search ? search : "")),
              }}
            />
          ) : (
            <Outlet />
          )}
        </div>
      </Content>
    </Layout>
  );
};
export default JazzContent;
