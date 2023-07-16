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
import { useAuth } from "@/commons/auth.tsx";

export interface TabProps {
  form: FormInstance<Veranstaltung>;
  veranstaltung?: Veranstaltung;
  optionen?: OptionValues;
  orte?: Orte;
}

export default function VeranstaltungTabs({
  optionen,
  orte,
  veranstaltung,
  form,
}: {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  orte: Orte;
  form: FormInstance<Veranstaltung>;
}) {
  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);
  const { context } = useAuth();
  const onlyKasse = !context?.currentUser.accessrights?.isOrgaTeam;

  const brauchtHotel = Form.useWatch(["artist", "brauchtHotel"], {
    form,
    preserve: true,
  });

  useEffect(() => {
    const page = search.get("page") ?? "";
    if (["allgemeines", "technik", "ausgaben", "hotel", "kasse", "presse"].includes(page)) {
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

  const kasseTab = {
    key: "kasse",
    label: <TabLabel type="kasse" title="Abendkasse" />,
    children: <TabKasse veranstaltung={veranstaltung} form={form} />,
  };
  const allTabs: TabsProps["items"] = [
    {
      key: "allgemeines",
      label: <TabLabel type="allgemeines" title="Allgemeines" />,
      children: <TabAllgemeines optionen={optionen} veranstaltung={veranstaltung} form={form} orte={orte} />,
    },
    {
      key: "technik",
      label: <TabLabel type="technik" title="Technik" />,
      children: <TabTechnik optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "ausgaben",
      label: <TabLabel type="ausgaben" title="Kalkulation" />,
      children: <TabKosten optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
    {
      key: "hotel",
      label: <TabLabel type="hotel" title="Hotel" />,
      children: <TabHotel veranstaltung={veranstaltung} optionen={optionen} form={form} />,
    },
    kasseTab,
    {
      key: "presse",
      label: <TabLabel type="presse" title="Presse" />,
      children: <TabPresse optionen={optionen} veranstaltung={veranstaltung} form={form} />,
    },
  ];

  useEffect(() => {
    if (onlyKasse) {
      return setTabs([kasseTab]);
    }
    if (brauchtHotel) {
      setTabs(allTabs);
    } else {
      const result = [...(allTabs || [])];
      result.splice(3, 1);
      setTabs(result);
    }
  }, [brauchtHotel, optionen, activePage, veranstaltung, onlyKasse]);

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
