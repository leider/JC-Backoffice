import * as React from "react";
import { useEffect, useState } from "react";
import { Layout, Menu, theme } from "antd";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { LoginState, useAuth } from "@/commons/authConsts.ts";
import { IconForSmallBlock } from "@/components/Icon";
import { ItemType } from "antd/es/menu/hooks/useItems";
import { wikisubdirs } from "@/commons/loader.ts";

const { Header, Content } = Layout;

const EXPERIMENTAL = true;
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
  sendmail = "sendmail",
  mail = "mail",
  team = "team",
  belege = "belege",
  wiki = "wiki",
  users = "users",
  rider = "rider",
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

  const [items, setItems] = useState<ItemType[]>([]);
  useEffect(
    () => {
      const localItems: ItemType[] = [];
      if (context?.currentUser?.accessrights?.isOrgaTeam) {
        localItems.push({
          key: menuKeys.veranstaltung,
          icon: <IconForSmallBlock iconName="Speaker" />,
          label: <Link to="/veranstaltungen">Veranstaltungen</Link>,
        });
        if (context?.currentUser?.accessrights?.isSuperuser) {
          localItems.push({
            key: menuKeys.mail,
            icon: <IconForSmallBlock iconName="EnvelopeFill" />,
            label: "Mails...",
            children: [
              {
                key: menuKeys.mailrules,
                icon: <IconForSmallBlock iconName="ListStars" />,
                label: <Link to="/mailrules">Regeln</Link>,
              },
              {
                key: menuKeys.mailinglists,
                icon: <IconForSmallBlock iconName="ListCheck" />,
                label: <Link to="/mailinglists">Listen</Link>,
              },
              {
                key: menuKeys.sendmail,
                icon: <IconForSmallBlock iconName="Send" />,
                label: <Link to="/sendmail">Mail senden...</Link>,
              },
            ],
          });
        }
        const optionenChildren: ItemType[] = [
          {
            type: "group",
            label: "Optionen und Orte",
            children: [
              {
                key: menuKeys.optionen,
                icon: <IconForSmallBlock iconName="FuelPump" />,
                label: <Link to="/optionen">Optionen</Link>,
              },
              {
                key: menuKeys.orte,
                icon: <IconForSmallBlock iconName="Houses" />,
                label: <Link to="/orte">Orte</Link>,
              },
            ],
          },
          {
            type: "group",
            label: "Kalender und Termine",
            children: [
              {
                key: menuKeys.kalender,
                icon: <IconForSmallBlock iconName="Calendar2Range" />,
                label: <Link to="/kalender">Kalender</Link>,
              },
              {
                key: menuKeys.termine,
                icon: <IconForSmallBlock iconName="Calendar2Month" />,
                label: <Link to="/termine">Termine</Link>,
              },
            ],
          },
          {
            key: menuKeys.kassenbericht,
            label: <Link to="/kassenbericht">Kassenbericht</Link>,
          },
        ];
        localItems.push({
          key: menuKeys.option,
          icon: <IconForSmallBlock iconName="Toggles" />,
          label: "Optionen...",
          children: optionenChildren,
        });
        if (context?.currentUser?.accessrights?.isSuperuser) {
          optionenChildren.push({
            key: menuKeys.imageoverview,
            label: <Link to="/imageoverview">Bilder verwalten</Link>,
          });
        }
      }
      localItems.push({
        key: menuKeys.team,
        icon: <IconForSmallBlock iconName="People" />,
        label: <Link to="/team">Team</Link>,
      });
      localItems.push({
        key: menuKeys.belege,
        icon: <IconForSmallBlock iconName="Camera" />,
        label: <Link to="/belege">Belege</Link>,
      });
      if (context?.currentUser?.accessrights?.isOrgaTeam) {
        localItems.push({
          key: menuKeys.programmheft,
          icon: <IconForSmallBlock iconName="Calendar2Check" />,
          label: <Link to="/programmheft">Programmheft</Link>,
        });
      }
      if (subdirs.length > 0) {
        const wikisubdirEntries = () =>
          subdirs.map((dir) => {
            return {
              key: `wiki-${dir}`,
              label: <Link to={`/wiki/${dir}/`}>{dir}</Link>,
            };
          });

        localItems.push({
          key: menuKeys.wiki,
          icon: <IconForSmallBlock iconName="Journals" />,
          label: "Wiki...",
          children: wikisubdirEntries(),
        });
      }
      localItems.push({
        key: menuKeys.users,
        icon: <IconForSmallBlock iconName="PeopleFill" />,
        children: [
          {
            key: "allUsers",
            icon: <IconForSmallBlock iconName="PersonLinesFill" />,
            label: <Link to={"/users"}>Übersicht</Link>,
          },
          {
            key: "logout",
            icon: <IconForSmallBlock iconName="PersonFillX" />,
            label: (
              <a
                onClick={() => {
                  logout();
                }}
              >
                Abmelden
              </a>
            ),
          },
        ],
        label: "Users",
      });
      setItems(localItems);
      if (context?.currentUser?.accessrights?.isOrgaTeam && EXPERIMENTAL) {
        localItems.push({
          key: menuKeys.rider,
          icon: <IconForSmallBlock iconName="UniversalAccess" />,
          label: <Link to="/rider">Rider</Link>,
        });
      }
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
