import { Link } from "react-router";
import { ConfigProvider, Menu } from "antd";
import * as React from "react";
import { useCallback, useState } from "react";
import { Header } from "antd/es/layout/layout";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Preferences from "@/components/content/menu/Preferences.tsx";
import { useCreateMenuItems } from "@/components/content/menu/useCreateMenuItems.tsx";

export function JazzHeader({ activeElement }: { readonly activeElement: string }) {
  const { currentUser } = useJazzContext();
  const { sm } = useBreakpoint();
  const [isOpen, setIsOpen] = useState(false);

  const { items, userMenu } = useCreateMenuItems({ setIsOpen, sm });

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
          {sm ? (
            <>
              <div style={{ width: 40 }} />
              <Menu
                items={userMenu ? [userMenu] : []}
                mode="horizontal"
                overflowedIndicator={undefined}
                selectedKeys={[activeElement]}
                style={{ minWidth: 20 }}
                theme="dark"
              />
            </>
          ) : undefined}
        </ConfigProvider>
      </div>
      <Preferences isOpen={isOpen} setIsOpen={setIsOpen} />
    </Header>
  );
}
