import { useMemo } from "react";
import useMenuNodes from "@/components/content/menu/MenuNodes.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Accessrights from "jc-shared/user/accessrights.ts";
import { ItemType } from "antd/es/menu/interface";

export function useCreateMenuItems() {
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

  return useMemo(() => {
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
}
