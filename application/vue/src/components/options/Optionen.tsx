import { useQuery } from "@tanstack/react-query";
import { optionen as optionenLoader, saveOptionen } from "@/rest/loader.ts";
import * as React from "react";
import { useCallback, useState } from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import { Tabs, TabsProps } from "antd";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import JazzFormAndHeader from "../content/JazzFormAndHeader";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import TabOptionen from "@/components/options/TabOptionen.tsx";
import TabArtists from "@/components/options/TabArtists.tsx";
import TabHotels from "@/components/options/TabHotels.tsx";

function TabLabel({ activePage, title, type }: { readonly activePage: string; readonly type: string; readonly title: string }) {
  const { color } = colorsAndIconsForSections;
  const { brightText } = useJazzContext();
  const active = activePage === type;

  const farbe = color("allgemeines");

  return (
    <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? brightText : farbe }}>
      <IconForSmallBlock iconName="CheckSquare" style={{ marginBottom: -3 }} />
      &nbsp; {title}
    </b>
  );
}

export default function Optionen() {
  const { data, refetch } = useQuery({
    queryKey: ["optionen"],
    queryFn: optionenLoader,
  });

  const mutateOptionen = useJazzMutation({
    saveFunction: saveOptionen,
    queryKey: "optionen",
    successMessage: "Die Optionen wurden gespeichert",
  });

  const [activePage, setActivePage] = useState<string>("optionen");

  const tabs: TabsProps["items"] = [
    {
      key: "optionen",
      label: <TabLabel activePage={activePage} title="Optionen" type="optionen" />,
      children: <TabOptionen />,
    },
    {
      key: "artists",
      label: <TabLabel activePage={activePage} title="Künstler" type="artists" />,
      children: <TabArtists />,
    },
    {
      key: "hotels",
      label: <TabLabel activePage={activePage} title="Hotels" type="hotels" />,
      children: <TabHotels />,
    },
  ];

  const saveForm = useCallback((vals: OptionValues) => mutateOptionen.mutate(new OptionValues(vals)), [mutateOptionen]);

  return (
    <JazzFormAndHeader<OptionValues> data={data} resetChanges={refetch} saveForm={saveForm} title="Optionen">
      <Tabs activeKey={activePage} items={tabs} onChange={setActivePage} type="card" />
    </JazzFormAndHeader>
  );
}
