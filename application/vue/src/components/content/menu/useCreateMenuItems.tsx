import * as React from "react";
import { useCallback, useMemo } from "react";
import useMenuNodes, { menuKeys } from "@/components/content/menu/MenuNodes.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Accessrights from "jc-shared/user/accessrights.ts";
import { ItemType } from "antd/es/menu/interface";
import { MenuIcon } from "@/components/content/menu/MenuIcon.tsx";
import { Link } from "react-router";
import { useAuth } from "@/commons/authConsts.ts";

export function useCreateMenuItems({ setIsOpen, sm }: { setIsOpen: (open: boolean) => void; sm?: boolean }) {
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

  const openPreferences = useCallback(() => setIsOpen(true), [setIsOpen]);

  const userMenu = useMemo(() => {
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

    return { ...userMenuStatic, label: currentUser.id };
  }, [currentUser.id, logout, openPreferences]);

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
    if (!sm) {
      localItems.push(userMenu);
    }
    return localItems;
  }, [accessrights, sm, subdirs.length, submenus, userMenu]);

  return { items, userMenu };
}
