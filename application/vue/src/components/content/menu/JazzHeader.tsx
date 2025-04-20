import { Link } from "react-router";
import { ConfigProvider, Menu } from "antd";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Header } from "antd/es/layout/layout";
import useMenuNodes, { menuKeys } from "@/components/content/menu/MenuNodes.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Accessrights from "jc-shared/user/accessrights.ts";
import { useAuth } from "@/commons/authConsts.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { ItemType } from "antd/es/menu/interface";
import { MenuIcon } from "./MenuIcon";
import Preferences from "@/components/content/menu/Preferences.tsx";

export function JazzHeader({ activeElement }: { readonly activeElement: string }) {
  const { currentUser, wikisubdirs } = useJazzContext();
  const { logout } = useAuth();
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

  const [isOpen, setIsOpen] = useState(false);

  const submenus = useMenuNodes(accessrights, subdirs);

  const items = useMemo(() => {
    const { mailMenu, optionenMenu, teamMenu, veranstaltungMenu, wikiMenu } = submenus;
    const { isOrgaTeam, isSuperuser } = accessrights;
    const localItems: ItemType[] = [];
    if (isOrgaTeam) {
      localItems.push(veranstaltungMenu);
    }
    localItems.push(teamMenu);
    if (isOrgaTeam) {
      if (isSuperuser) {
        localItems.push(mailMenu);
      }
      localItems.push(optionenMenu);
    }
    if (subdirs.length > 0) {
      localItems.push(wikiMenu);
    }
    return localItems;
  }, [accessrights, subdirs.length, submenus]);

  const [userMenu, setUserMenu] = useState<ItemType>();
  const { lg } = useBreakpoint();

  const openPreferences = useCallback(() => setIsOpen(true), []);

  useEffect(() => {
    const userMenuStatic = {
      key: menuKeys.users,
      icon: <MenuIcon name="PeopleFill" />,
      children: [
        {
          key: "allUsers",
          icon: <MenuIcon name="PersonLinesFill" />,
          label: <Link to="/users">Übersicht</Link>,
        },
        {
          key: "preferences",
          icon: <MenuIcon name="Sliders" />,
          label: <a onClick={openPreferences}>Anzeige Einstellungen</a>,
        },
        {
          key: "logout",
          icon: <MenuIcon name="PersonFillX" />,
          label: <a onClick={logout}>Abmelden</a>,
        },
        {
          key: "version",
          icon: <MenuIcon name="Clock" />,
          label: `Version: ${__APP_VERSION__}`,
        },
      ],
      label: "Users",
    };
    const copiedUserMenu = { ...userMenuStatic };
    const id = currentUser.id;
    copiedUserMenu.label = (!lg && id && id.length > 10 ? id.substring(0, 8) + "..." : id) || "Users";
    setUserMenu(copiedUserMenu);
  }, [currentUser.id, lg, logout, openPreferences]);

  const reload = useCallback(() => location.reload(), []);

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
        onClick={reload}
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
        to="/"
      >
        <img alt="Jazzclub Logo" src="/vue/img/logo_weiss.png" />
      </Link>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "calc(100% - 64px)" }}>
        <ConfigProvider theme={{ components: { Menu: { subMenuItemSelectedColor: "white" } } }}>
          <Menu
            items={currentUser.id ? items : []}
            mode="horizontal"
            overflowedIndicator="Mehr..."
            selectedKeys={[activeElement]}
            style={{ flex: "auto", minWidth: 0, flexGrow: 2 }}
            theme="dark"
          />
          <div style={{ width: 40 }} />
          <Menu items={userMenu ? [userMenu] : []} mode="horizontal" selectedKeys={[activeElement]} theme="dark" />
        </ConfigProvider>
      </div>
      <Preferences isOpen={isOpen} setIsOpen={setIsOpen} />
    </Header>
  );
}
