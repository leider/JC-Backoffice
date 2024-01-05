import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { Link, useLocation } from "react-router-dom";
import { ItemType } from "antd/es/menu/hooks/useItems";
import useMenuNodes, { menuKeys } from "@/components/content/MenuNodes.tsx";
import { JazzContext, useCreateJazzContext } from "@/components/content/useJazzContext.ts";
import InnerContent from "@/components/content/InnerContent.tsx";

const { Header, Content } = Layout;

const JazzContent: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { pathname } = useLocation();
  const [activeElement, setActiveElement] = useState<string>("");
  const context = useCreateJazzContext();

  const subdirs = useMemo(() => {
    return context.wikisubdirs;
  }, [context.wikisubdirs]);

  const accessrights = useMemo(() => {
    return context.currentUser.accessrights;
  }, [context.currentUser]);

  const submenus = useMenuNodes(accessrights, subdirs);

  const items = useMemo(() => {
    const { belegeMenu, mailMenu, optionenMenu, programmheftMenu, teamMenu, veranstaltungMenu, wikiMenu } = submenus;
    const { isOrgaTeam, isSuperuser } = accessrights;
    const localItems: ItemType[] = [];
    if (isOrgaTeam) {
      localItems.push(veranstaltungMenu);
    }
    localItems.push(teamMenu);
    localItems.push(belegeMenu);
    if (isOrgaTeam) {
      if (isSuperuser) {
        localItems.push(mailMenu);
      }
      localItems.push(optionenMenu);
      localItems.push(programmheftMenu);
    }
    if (subdirs.length > 0) {
      localItems.push(wikiMenu);
    }
    return localItems;
  }, [accessrights, subdirs.length, submenus]);

  useEffect(() => {
    const result = Object.keys(menuKeys).find((key) => pathname.search(key) > 0);
    if (pathname.search("preview") > 0) {
      return setActiveElement("team");
    }
    setActiveElement(result || "");
  }, [pathname]);

  return (
    <JazzContext.Provider value={context}>
      <Layout>
        <Header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            width: "100%",
            paddingInlineStart: "5px",
            paddingInlineEnd: "10px",
            height: "50px",
            lineHeight: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Link
            to={"/"}
            onClick={() => location.reload()}
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img src={"/vue/img/logo_weiss.png"} alt="Jazzclub Logo" />
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
            <Menu theme="dark" mode="horizontal" items={items} selectedKeys={[activeElement]} style={{ flexGrow: 2 }} />
            <Menu theme="dark" mode="horizontal" items={[submenus.userMenu]} selectedKeys={[activeElement]} />
          </div>
        </Header>

        <Content
          style={{
            minHeight: "calc(100vh - 65px)",
          }}
        >
          <div style={{ background: colorBgContainer }}>
            <InnerContent />
          </div>
        </Content>
      </Layout>
    </JazzContext.Provider>
  );
};

export default JazzContent;
