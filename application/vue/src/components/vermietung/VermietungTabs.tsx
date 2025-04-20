import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsProps } from "antd";
import { ButtonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useSearchParams } from "react-router";
import TabAllgemeines from "@/components/vermietung/allgemeines/TabAllgemeines.tsx";
import TabTechnik from "@/components/vermietung/technik/TabTechnik.tsx";
import TabKosten from "@/components/vermietung/kosten/TabKosten.tsx";
import TabPresse from "@/components/vermietung/presse/TabPresse.tsx";
import TabAngebot from "@/components/vermietung/angebot/TabAngebot.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useWatch } from "antd/es/form/Form";

function TabLabel({ activePage, title, type }: { readonly activePage: ButtonType; readonly type: ButtonType; readonly title: string }) {
  const { icon, color } = colorsAndIconsForSections;
  const { brightText } = useJazzContext();
  const active = activePage === type;

  const farbe = color(type);

  return (
    <b
      style={{
        margin: -16,
        padding: 16,
        backgroundColor: active ? farbe : "inherit",
        color: active ? brightText : farbe,
      }}
    >
      <IconForSmallBlock iconName={icon(type)} /> {title}
    </b>
  );
}

export default function VermietungTabs() {
  const { optionen } = useJazzContext();

  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<ButtonType>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);

  useEffect(() => {
    const page = (search.get("page") ?? "allgemeines") as ButtonType;
    if (["allgemeines", "angebot", "technik", "ausgaben", "presse"].includes(page)) {
      setActivePage(page);
    } else {
      setActivePage("allgemeines");
      setSearch({ page: "allgemeines" }, { replace: true });
    }
  }, [search, setSearch]);

  const brauchtTechnik = useWatch("brauchtTechnik", { preserve: true });
  const brauchtPresse = useWatch("brauchtPresse", { preserve: true });

  useEffect(() => {
    const tabAllgemeines = {
      key: "allgemeines",
      label: <TabLabel activePage={activePage} title="Allgemeines" type="allgemeines" />,
      children: <TabAllgemeines />,
    };
    const tabAngebot = {
      key: "angebot",
      label: <TabLabel activePage={activePage} title="Angebot / Vertrag" type="angebot" />,
      children: <TabAngebot />,
    };

    const tabTechnik = {
      key: "technik",
      label: <TabLabel activePage={activePage} title="Technik" type="technik" />,
      children: <TabTechnik />,
    };
    const tabKosten = {
      key: "ausgaben",
      label: <TabLabel activePage={activePage} title="Kalkulation" type="ausgaben" />,
      children: <TabKosten />,
    };

    const tabPresse = {
      key: "presse",
      label: <TabLabel activePage={activePage} title="Presse" type="presse" />,
      children: <TabPresse />,
    };

    const result = [tabAllgemeines, tabAngebot];
    if (brauchtTechnik) {
      result.push(tabTechnik);
    }
    result.push(tabKosten);
    if (brauchtPresse) {
      result.push(tabPresse);
    }
    setTabs(result);
  }, [activePage, optionen, brauchtTechnik, brauchtPresse]);

  const changeTab = useCallback((newPage: string) => setSearch({ page: newPage }), [setSearch]);

  return <Tabs activeKey={activePage} items={tabs} onChange={changeTab} type="card" />;
}
