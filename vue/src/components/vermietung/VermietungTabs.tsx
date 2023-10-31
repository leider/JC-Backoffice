import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { Form, Tabs, TabsProps } from "antd";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { IconForSmallBlock } from "@/components/Icon";
import { useSearchParams } from "react-router-dom";
import TabAllgemeines from "@/components/vermietung/allgemeines/TabAllgemeines.tsx";
import TabTechnik from "@/components/vermietung/technik/TabTechnik.tsx";
import TabKosten from "@/components/vermietung/kosten/TabKosten.tsx";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import TabPresse from "@/components/vermietung/presse/TabPresse.tsx";

export default function VermietungTabs() {
  const context = useContext(VermietungContext);
  const form = context!.form;
  const optionen = context!.optionen;

  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);

  useEffect(
    () => {
      const page = search.get("page") ?? "";
      if (["allgemeines", "technik", "ausgaben", "presse"].includes(page)) {
        setActivePage(page);
      } else {
        setActivePage("allgemeines");
        setSearch({ page: "allgemeines" }, { replace: true });
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [search],
  );

  function TabLabel({ title, type }: { type: buttonType; title: string }) {
    const { icon, color } = useColorsAndIconsForSections();
    const active = activePage === type;

    const farbe = color(type);

    return (
      <b
        style={{
          margin: -16,
          padding: 16,
          backgroundColor: active ? farbe : "inherit",
          color: active ? "#FFF" : farbe,
        }}
      >
        <IconForSmallBlock iconName={icon(type)} /> {title}
      </b>
    );
  }

  const brauchtTechnik = Form.useWatch("brauchtTechnik", {
    form,
    preserve: true,
  });
  const brauchtPresse = Form.useWatch("brauchtPresse", {
    form,
    preserve: true,
  });

  useEffect(
    () => {
      const tabAllgemeines = {
        key: "allgemeines",
        label: <TabLabel type="allgemeines" title="Allgemeines" />,
        children: <TabAllgemeines />,
      };

      const tabTechnik = {
        key: "technik",
        label: <TabLabel type="technik" title="Technik" />,
        children: <TabTechnik />,
      };
      const tabKosten = {
        key: "ausgaben",
        label: <TabLabel type="ausgaben" title="Kalkulation" />,
        children: <TabKosten />,
      };

      const tabPresse = {
        key: "presse",
        label: <TabLabel type="presse" title="Presse" />,
        children: <TabPresse />,
      };

      const result = [tabAllgemeines];
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
      type="card"
      activeKey={activePage}
      items={tabs}
      onChange={(newPage) => {
        setSearch({ page: newPage });
      }}
    />
  );
}
