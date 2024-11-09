import * as React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Tabs, TabsProps } from "antd";
import { buttonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TabAllgemeines from "@/components/konzert/allgemeines/TabAllgemeines";
import TabTechnik from "@/components/konzert/technik/TabTechnik";
import TabKosten from "@/components/konzert/kosten/TabKosten";
import TabKasse from "@/components/konzert/kasse/TabKasse";
import TabHotel from "@/components/konzert/hotel/TabHotel";
import TabPresse from "@/components/konzert/presse/TabPresse.tsx";
import { useSearchParams } from "react-router-dom";
import { KonzertContext } from "@/components/konzert/KonzertComp.tsx";
import TabGaeste from "@/components/konzert/gaeste/TabGaeste.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useWatch } from "antd/es/form/Form";

export default function KonzertTabs() {
  const konzertContext = useContext(KonzertContext);
  const { optionen } = useJazzContext();
  const form = konzertContext!.form;

  const [search, setSearch] = useSearchParams();
  const [activePage, setActivePage] = useState<string>("allgemeines");
  const [tabs, setTabs] = useState<TabsProps["items"]>([]);
  const { currentUser } = useJazzContext();
  const onlyKasse = useMemo(() => !currentUser.accessrights.isOrgaTeam, [currentUser.accessrights.isOrgaTeam]);

  const brauchtHotel = useWatch(["artist", "brauchtHotel"], {
    form,
    preserve: true,
  });
  const brauchtPresse = useWatch("brauchtPresse", {
    form,
    preserve: true,
  });

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

  const TabLabel = useCallback(
    ({ title, type }: { type: buttonType; title: string }) => {
      const { icon, color } = colorsAndIconsForSections;
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
    },
    [activePage],
  );
  useEffect(() => {
    const kasseTab = {
      key: "kasse",
      label: <TabLabel type="kasse" title="Abendkasse" />,
      children: <TabKasse />,
    };
    const gaesteTab = {
      key: "gaeste",
      label: <TabLabel type="gaeste" title="Gäste am Abend" />,
      children: <TabGaeste />,
    };
    const allTabs: TabsProps["items"] = [
      {
        key: "allgemeines",
        label: <TabLabel type="allgemeines" title="Allgemeines" />,
        children: <TabAllgemeines />,
      },
      gaesteTab,
      {
        key: "technik",
        label: <TabLabel type="technik" title="Technik" />,
        children: <TabTechnik />,
      },
      {
        key: "ausgaben",
        label: <TabLabel type="ausgaben" title="Kalkulation" />,
        children: <TabKosten />,
      },
      {
        key: "hotel",
        label: <TabLabel type="hotel" title="Hotel" />,
        children: <TabHotel />,
      },
      kasseTab,
    ];
    if (onlyKasse) {
      return setTabs([gaesteTab, kasseTab]);
    }
    if (brauchtPresse) {
      allTabs.push({
        key: "presse",
        label: <TabLabel type="presse" title="Presse" />,
        children: <TabPresse />,
      });
    }
    if (brauchtHotel) {
      setTabs(allTabs);
    } else {
      const result = [...(allTabs || [])];
      result.splice(4, 1);
      setTabs(result);
    }
  }, [brauchtHotel, optionen, activePage, onlyKasse, TabLabel, brauchtPresse]);

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
