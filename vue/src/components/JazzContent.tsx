import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { LoginState, useAuth } from "@/commons/authConsts.ts";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { wikisubdirs } from "@/commons/loader.ts";
import useMenuNodes, { menuKeys } from "@/components/MenuNodes.tsx";

const { Header, Content } = Layout;

const JazzContent: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { loginState, context } = useAuth();
  const { pathname, search } = useLocation();
  const [activeElement, setActiveElement] = useState<string>("");
  const [subdirs, setSubdirs] = useState<string[]>([]);
  useEffect(() => {
    const loadSubdirs = async () => {
      const result = await wikisubdirs();
      setSubdirs(result.dirs);
    };
    if (loginState === LoginState.LOGGED_IN) {
      loadSubdirs();
    }
  }, [loginState]);

  const accessrights = useMemo(() => context.currentUser.accessrights, [context]);

  const { belegeMenu, mailMenu, optionenMenu, programmheftMenu, teamMenu, userMenu, veranstaltungMenu, wikiMenu } = useMenuNodes(
    accessrights,
    subdirs,
  );

  const [items, setItems] = useState<ItemType[]>([]);
  useEffect(
    () => {
      const localItems: ItemType[] = [];
      if (accessrights.isOrgaTeam) {
        localItems.push(veranstaltungMenu);
        if (accessrights.isSuperuser) {
          localItems.push(mailMenu);
        }
        localItems.push(optionenMenu);
      }
      localItems.push(teamMenu);
      localItems.push(belegeMenu);
      if (accessrights.isOrgaTeam) {
        localItems.push(programmheftMenu);
      }
      if (subdirs.length > 0) {
        localItems.push(wikiMenu);
      }
      localItems.push(userMenu);
      setItems(localItems);
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [context, subdirs],
  );

  useEffect(() => {
    const result = Object.keys(menuKeys).find((key) => pathname.search(key) > 0);

    setActiveElement(result || "");
  }, [pathname]);

  return (
    <Layout>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          paddingInline: "20px",
        }}
      >
        <Link to={"/"} onClick={() => location.reload()}>
          <div
            style={{
              float: "left",
              width: "54px",
              height: "40px",
              margin: "12px 12px 0px 0px",
            }}
          >
            <img src={"/vue/img/logo_weiss.png"} alt="Jazzclub Logo" />
          </div>
        </Link>
        <Menu theme="dark" mode="horizontal" items={items} selectedKeys={[activeElement]} />
      </Header>

      <Content
        style={{
          minHeight: "calc(100vh - 65px)",
        }}
      >
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
