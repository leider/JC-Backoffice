import { Link } from "react-router-dom";
import { Menu } from "antd";
import * as React from "react";
import { useMemo } from "react";
import { Header } from "antd/es/layout/layout";
import useMenuNodes from "@/components/content/MenuNodes.tsx";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Accessrights from "jc-shared/user/accessrights.ts";

export function JazzHeader({ activeElement }: { activeElement: string }) {
  const { currentUser, wikisubdirs } = useJazzContext();
  const subdirs = useMemo(() => {
    return wikisubdirs;
  }, [wikisubdirs]);

  const accessrights = useMemo(() => {
    if (currentUser.id) {
      return currentUser.accessrights;
    } else {
      return new Accessrights();
    }
  }, [currentUser]);

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
  return (
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
  );
}
