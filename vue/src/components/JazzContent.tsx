import * as React from "react";
import { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { LoginState, useAuth } from "@/commons/auth";
import { IconForSmallBlock } from "@/components/Icon";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { wikisubdirs } from "@/commons/loader-for-react";

const { Header, Content } = Layout;
enum menuKeys {
  veranstaltung = "veranstaltung",
  optionen = "optionen",
  option = "option",
  programmheft = "programmheft",
  orte = "orte",
  kalender = "kalender",
  termine = "termine",
  kassenbericht = "kassenbericht",
  imageoverview = "imageoverview",
  mailrules = "mailrules",
  mailinglists = "mailinglists",
  manualmail = "manualmail",
  rundmail = "rundmail",
  mail = "mail",
  team = "team",
  belege = "belege",
  wiki = "wiki",
}

const JazzContent: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const { loginState, context, logout } = useAuth();
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

  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const localItems: ItemType[] = [];
    if (context?.currentUser?.accessrights?.isOrgaTeam) {
      localItems.push({
        key: menuKeys.veranstaltung,
        icon: <IconForSmallBlock iconName="Speaker" />,
        label: <Link to="/veranstaltungen">Veranstaltungen</Link>,
      });
      localItems.push({
        key: menuKeys.programmheft,
        icon: <IconForSmallBlock iconName="Calendar2Check" />,
        label: <Link to="/programmheft">Programmheft</Link>,
      });
      const optionenChildren: ItemType[] = [
        {
          type: "group",
          label: "Optionen und Orte",
          children: [
            { key: menuKeys.optionen, label: <Link to="/optionen">Optionen</Link> },
            { key: menuKeys.orte, label: <Link to="/orte">Orte</Link> },
          ],
        },
        {
          type: "group",
          label: "Kalender und Termine",
          children: [
            { key: menuKeys.kalender, label: <Link to="/kalender">Kalender</Link> },
            { key: menuKeys.termine, label: <Link to="/termine">Termine</Link> },
          ],
        },
        { key: menuKeys.kassenbericht, label: <Link to="/kassenbericht">Kassenbericht</Link> },
      ];
      localItems.push({
        key: menuKeys.option,
        icon: <IconForSmallBlock iconName="Toggles" />,
        label: "Optionen...",
        children: optionenChildren,
      });
      if (context?.currentUser?.accessrights?.isSuperuser) {
        optionenChildren.push({ key: menuKeys.imageoverview, label: <Link to="/imageoverview">Bilder verwalten</Link> });
        localItems.push({
          key: menuKeys.mail,
          icon: <IconForSmallBlock iconName="EnvelopeFill" />,
          label: "Mails...",
          children: [
            {
              type: "group",
              label: "Regeln und Listen",
              children: [
                { key: menuKeys.mailrules, label: <Link to="/mailrules">Regeln</Link> },
                { key: menuKeys.mailinglists, label: <Link to="/mailinglists">Listen</Link> },
              ],
            },
            {
              type: "group",
              label: "Senden",
              children: [
                { key: menuKeys.manualmail, label: <Link to="/manualmail">Regeln</Link> },
                { key: menuKeys.rundmail, label: <Link to="/rundmail">Listen</Link> },
              ],
            },
          ],
        });
      }
    }
    localItems.push({ key: menuKeys.team, icon: <IconForSmallBlock iconName="People" />, label: <Link to="/team">Team</Link> });
    localItems.push({ key: menuKeys.belege, icon: <IconForSmallBlock iconName="Camera" />, label: <Link to="/belege">Belege</Link> });
    const wikisubdirEntries = () =>
      subdirs.map((dir) => {
        return { key: `wiki-${dir}`, label: <Link to={`/wiki/${dir}`}>{dir}</Link> };
      });

    if (subdirs.length > 0) {
      localItems.push({
        key: menuKeys.wiki,
        icon: <IconForSmallBlock iconName="Journals" />,
        label: "Wiki...",
        children: wikisubdirEntries(),
      });
    }
    localItems.push({
      key: "logout",
      icon: <IconForSmallBlock iconName="PersonCircle" />,
      label: (
        <a
          onClick={() => {
            logout();
          }}
        >
          Abmelden
        </a>
      ),
    });
    setItems(localItems);
  }, [context, subdirs]);

  useEffect(() => {
    const result = Object.keys(menuKeys).find((key) => pathname.search(key) > 0);

    setActiveElement(result || "");
  }, [pathname]);

  return (
    <Layout>
      <Header style={{ position: "sticky", top: 0, zIndex: 1, width: "100%", paddingInline: "20px" }}>
        <div
          style={{
            float: "left",
            width: "54px",
            height: "40px",
            margin: "12px 12px 0px 0px",
          }}
        >
          <img src={"/img/logo_weiss.png"} alt="Jazzclub Logo" />
        </div>
        <Menu theme="dark" mode="horizontal" items={items} selectedKeys={[activeElement]} />
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
