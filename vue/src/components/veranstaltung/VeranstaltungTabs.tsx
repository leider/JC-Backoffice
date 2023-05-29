import * as React from "react";
import { useEffect, useState } from "react";
import { Form, FormInstance, Tabs, TabsProps } from "antd";
import { buttonType, useColorsAndIconsForSections } from "@/components/colorsIconsForSections";
import { IconForSmallBlock } from "@/components/Icon";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import TabAllgemeines from "@/components/veranstaltung/allgemeines/TabAllgemeines";
import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import TabTechnik from "@/components/veranstaltung/technik/TabTechnik";
import TabKosten from "@/components/veranstaltung/kosten/TabKosten";
import TabKasse from "@/components/veranstaltung/kasse/TabKasse";
import TabHotel from "@/components/veranstaltung/hotel/TabHotel";
import TabPresse from "@/components/veranstaltung/presse/TabPresse";
import { useSearchParams } from "react-router-dom";

function TabLabel({ title, type, activePage }: { type: buttonType; title: string; activePage: string }) {
  const { icon, color } = useColorsAndIconsForSections();

  const farbe = color(type);
  const active = activePage === type;
  return (
    <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? "#FFF" : farbe }}>
      <IconForSmallBlock iconName={icon(type)} /> {title}
    </b>
  );
}

export default function VeranstaltungTabs({
  optionen,
  orte,
  veranstaltung,
  form,
  updateStateStuff,
}: {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  orte: Orte;
  form: FormInstance<Veranstaltung>;
  updateStateStuff: () => void;
}) {
  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);

  const brauchtHotel = Form.useWatch(["artist", "brauchtHotel"]);

  useEffect(() => {
    console.log({ brauchtHotel });
  }, [brauchtHotel]);

  useEffect(() => {
    const page = search.get("page") ?? "";
    if (["allgemeines", "technik", "ausgaben", "hotel", "kasse", "presse"].includes(page)) {
      setActivePage(page);
    } else {
      setActivePage("allgemeines");
      setSearch({ page: "allgemeines" });
    }
  }, [search]);

  const allTabs: TabsProps["items"] = [
    {
      key: "allgemeines",
      label: <TabLabel type="allgemeines" title="Allgemeines" activePage={activePage} />,
      children: (
        <TabAllgemeines veranstaltung={veranstaltung} form={form} optionen={optionen} orte={orte} titleAndDateCallback={updateStateStuff} />
      ),
    },
    {
      key: "technik",
      label: <TabLabel type="technik" title="Technik" activePage={activePage} />,
      children: <TabTechnik optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "ausgaben",
      label: <TabLabel type="ausgaben" title="Kalkulation" activePage={activePage} />,
      children: <TabKosten optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "hotel",
      label: <TabLabel type="hotel" title="Hotel" activePage={activePage} />,
      children: <TabHotel optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "kasse",
      label: <TabLabel type="kasse" title="Abendkasse" activePage={activePage} />,
      children: <TabKasse optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "presse",
      label: <TabLabel type="presse" title="Presse" activePage={activePage} />,
      children: <TabPresse optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
  ];

  useEffect(() => {
    if (brauchtHotel) {
      setTabs(allTabs);
    } else {
      const result = [...(allTabs || [])];
      result.splice(3, 1);
      setTabs(result);
    }
  }, [brauchtHotel]);

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
