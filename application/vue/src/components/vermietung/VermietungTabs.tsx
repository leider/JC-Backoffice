import * as React from "react";
import { useEffect, useState } from "react";
import { Tabs, TabsProps } from "antd";
import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { useSearchParams } from "react-router";
import TabAllgemeines from "@/components/vermietung/allgemeines/TabAllgemeines.tsx";
import TabTechnik from "@/components/vermietung/technik/TabTechnik.tsx";
import TabKosten from "@/components/vermietung/kosten/TabKosten.tsx";
import TabPresse from "@/components/vermietung/presse/TabPresse.tsx";
import TabAngebot from "@/components/vermietung/angebot/TabAngebot.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";

export default function VermietungTabs() {
  const form = useFormInstance();
  const { optionen } = useJazzContext();

  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);

  useEffect(
    () => {
      const page = search.get("page") ?? "";
      if (["allgemeines", "angebot", "technik", "ausgaben", "presse"].includes(page)) {
        setActivePage(page);
      } else {
        setActivePage("allgemeines");
        setSearch({ page: "allgemeines" }, { replace: true });
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [search],
  );

  function TabLabel({ title, type }: { type: buttonType; title: string }) {
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

  const brauchtTechnik = useWatch("brauchtTechnik", { form, preserve: true });
  const brauchtPresse = useWatch("brauchtPresse", { form, preserve: true });

  useEffect(
    () => {
      const tabAllgemeines = {
        key: "allgemeines",
        label: <TabLabel title="Allgemeines" type="allgemeines" />,
        children: <TabAllgemeines />,
      };
      const tabAngebot = {
        key: "angebot",
        label: <TabLabel title="Angebot / Vertrag" type="angebot" />,
        children: <TabAngebot />,
      };

      const tabTechnik = {
        key: "technik",
        label: <TabLabel title="Technik" type="technik" />,
        children: <TabTechnik />,
      };
      const tabKosten = {
        key: "ausgaben",
        label: <TabLabel title="Kalkulation" type="ausgaben" />,
        children: <TabKosten />,
      };

      const tabPresse = {
        key: "presse",
        label: <TabLabel title="Presse" type="presse" />,
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
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePage, optionen, brauchtTechnik, brauchtPresse],
  );

  return (
    <Tabs
      activeKey={activePage}
      items={tabs}
      onChange={(newPage) => {
        setSearch({ page: newPage });
      }}
      type="card"
    />
  );
}
