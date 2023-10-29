import * as React from "react";
import { useEffect, useState } from "react";
import { Form, FormInstance, Tabs, TabsProps } from "antd";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { IconForSmallBlock } from "@/components/Icon";
import OptionValues from "jc-shared/optionen/optionValues";
import { useSearchParams } from "react-router-dom";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import TabAllgemeines from "@/components/vermietung/allgemeines/TabAllgemeines.tsx";
import TabTechnik from "@/components/vermietung/technik/TabTechnik.tsx";
import TabKosten from "@/components/vermietung/kosten/TabKosten.tsx";

export interface VermietungTabProps {
  form?: FormInstance<Vermietung>;
  optionen?: OptionValues;
}

export default function VermietungTabs({ form, optionen }: VermietungTabProps) {
  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);

  useEffect(() => {
    const page = search.get("page") ?? "";
    if (["allgemeines", "technik", "ausgaben", "presse"].includes(page)) {
      setActivePage(page);
    } else {
      setActivePage("allgemeines");
      setSearch({ page: "allgemeines" }, { replace: true });
    }
  }, [search]);

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

  /*
    {
      key: "presse",
      label: <TabLabel type="presse" title="Presse" />,
      children: <TabPresse optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
*/

  const brauchtTechnik = Form.useWatch("brauchtTechnik", {
    form,
    preserve: true,
  });

  useEffect(() => {
    const tabAllgemeines = {
      key: "allgemeines",
      label: <TabLabel type="allgemeines" title="Allgemeines" />,
      children: <TabAllgemeines optionen={optionen} />,
    };

    const tabTechnik = {
      key: "technik",
      label: <TabLabel type="technik" title="Technik" />,
      children: <TabTechnik optionen={optionen} form={form} />,
    };
    const tabKosten = {
      key: "ausgaben",
      label: <TabLabel type="ausgaben" title="Kalkulation" />,
      children: <TabKosten form={form} />,
    };

    const result = [tabAllgemeines];
    if (brauchtTechnik) {
      result.push(tabTechnik);
    }
    result.push(tabKosten);
    setTabs(result);
  }, [activePage, optionen, brauchtTechnik]);

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
