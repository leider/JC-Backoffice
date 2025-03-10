import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsProps } from "antd";
import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TabAllgemeines from "@/components/konzert/allgemeines/TabAllgemeines";
import TabTechnik from "@/components/konzert/technik/TabTechnik";
import TabKosten from "@/components/konzert/kosten/TabKosten";
import TabKasse from "@/components/konzert/kasse/TabKasse";
import TabHotel from "@/components/konzert/hotel/TabHotel";
import TabPresse from "@/components/konzert/presse/TabPresse.tsx";
import { useSearchParams } from "react-router";
import TabGaeste from "@/components/konzert/gaeste/TabGaeste.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useWatch } from "antd/es/form/Form";

function TabLabel({ title, type, activePage }: { readonly type: buttonType; readonly title: string; readonly activePage: string }) {
  const { icon, color } = colorsAndIconsForSections;
  const { brightText } = useJazzContext();
  const active = activePage === type;

  const farbe = color(type);

  return (
    <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? brightText : farbe }}>
      <IconForSmallBlock iconName={icon(type)} style={{ marginBottom: -3 }} />
      &nbsp; {title}
    </b>
  );
}

export default function KonzertTabs() {
  const { optionen } = useJazzContext();

  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);
  const { currentUser } = useJazzContext();
  const onlyKasse = useMemo(() => !currentUser.accessrights.isOrgaTeam, [currentUser.accessrights.isOrgaTeam]);

  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { preserve: true });
  const brauchtPresse = useWatch("brauchtPresse", { preserve: true });

  useEffect(() => {
    const page = search.get("page") ?? "";
    if (currentUser.id && onlyKasse) {
      const pageWanted = ["kasse", "gaeste"].includes(page) ? page : "kasse";
      setActivePage(pageWanted);
      setSearch({ page: pageWanted }, { replace: true });
      return;
    }
    if (["allgemeines", "gaeste", "technik", "ausgaben", "hotel", "kasse", "presse"].includes(page)) {
      setActivePage(page);
    } else {
      setActivePage("allgemeines");
      setSearch({ page: "allgemeines" }, { replace: true });
    }
  }, [currentUser.id, onlyKasse, search, setSearch]);

  useEffect(() => {
    const kasseTab = { key: "kasse", label: <TabLabel activePage={activePage} title="Abendkasse" type="kasse" />, children: <TabKasse /> };
    const gaesteTab = {
      key: "gaeste",
      label: <TabLabel activePage={activePage} title="Gäste am Abend" type="gaeste" />,
      children: <TabGaeste />,
    };
    const allTabs: TabsProps["items"] = [
      {
        key: "allgemeines",
        label: <TabLabel activePage={activePage} title="Allgemeines" type="allgemeines" />,
        children: <TabAllgemeines />,
      },
      gaesteTab,
      { key: "technik", label: <TabLabel activePage={activePage} title="Technik" type="technik" />, children: <TabTechnik /> },
      { key: "ausgaben", label: <TabLabel activePage={activePage} title="Kalkulation" type="ausgaben" />, children: <TabKosten /> },
      { key: "hotel", label: <TabLabel activePage={activePage} title="Hotel" type="hotel" />, children: <TabHotel /> },
      kasseTab,
    ];
    if (onlyKasse) {
      return setTabs([gaesteTab, kasseTab]);
    }
    if (brauchtPresse) {
      allTabs.push({ key: "presse", label: <TabLabel activePage={activePage} title="Presse" type="presse" />, children: <TabPresse /> });
    }
    if (brauchtHotel) {
      setTabs(allTabs);
    } else {
      const result = [...(allTabs || [])];
      result.splice(4, 1);
      setTabs(result);
    }
  }, [brauchtHotel, optionen, activePage, onlyKasse, brauchtPresse]);

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
