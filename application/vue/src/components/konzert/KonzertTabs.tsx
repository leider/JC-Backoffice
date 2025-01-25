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
import useFormInstance from "antd/es/form/hooks/useFormInstance";

const TabLabel = ({ title, type, activePage }: { type: buttonType; title: string; activePage: string }) => {
  const { icon, color } = colorsAndIconsForSections;
  const { isDarkMode } = useJazzContext();
  const active = activePage === type;

  const farbe = color(type);
  const brightText = useMemo(() => (isDarkMode ? "#dcdcdc" : "#fff"), [isDarkMode]);

  return (
    <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? brightText : farbe }}>
      <IconForSmallBlock style={{ marginBottom: -3 }} iconName={icon(type)} />
      &nbsp; {title}
    </b>
  );
};

export default function KonzertTabs() {
  const form = useFormInstance();
  const { optionen } = useJazzContext();

  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);
  const { currentUser } = useJazzContext();
  const onlyKasse = useMemo(() => !currentUser.accessrights.isOrgaTeam, [currentUser.accessrights.isOrgaTeam]);

  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { form, preserve: true });
  const brauchtPresse = useWatch("brauchtPresse", { form, preserve: true });

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
    const kasseTab = { key: "kasse", label: <TabLabel type="kasse" title="Abendkasse" activePage={activePage} />, children: <TabKasse /> };
    const gaesteTab = {
      key: "gaeste",
      label: <TabLabel type="gaeste" title="Gäste am Abend" activePage={activePage} />,
      children: <TabGaeste />,
    };
    const allTabs: TabsProps["items"] = [
      {
        key: "allgemeines",
        label: <TabLabel type="allgemeines" title="Allgemeines" activePage={activePage} />,
        children: <TabAllgemeines />,
      },
      gaesteTab,
      { key: "technik", label: <TabLabel type="technik" title="Technik" activePage={activePage} />, children: <TabTechnik /> },
      { key: "ausgaben", label: <TabLabel type="ausgaben" title="Kalkulation" activePage={activePage} />, children: <TabKosten /> },
      { key: "hotel", label: <TabLabel type="hotel" title="Hotel" activePage={activePage} />, children: <TabHotel /> },
      kasseTab,
    ];
    if (onlyKasse) {
      return setTabs([gaesteTab, kasseTab]);
    }
    if (brauchtPresse) {
      allTabs.push({ key: "presse", label: <TabLabel type="presse" title="Presse" activePage={activePage} />, children: <TabPresse /> });
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
      type="card"
      activeKey={activePage}
      items={tabs}
      onChange={(newPage) => {
        setSearch({ page: newPage });
      }}
    />
  );
}
