import { useQuery } from "@tanstack/react-query";
import { optionen as optionenLoader, saveOptionen } from "@/commons/loader.ts";
import * as React from "react";
import { useState } from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import { Col, Row, Tabs, TabsProps } from "antd";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import Collapsible from "@/widgets/Collapsible.tsx";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import JazzFormAndHeader from "../content/JazzFormAndHeader";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";

function TabOptionen({ optionen }: { optionen: OptionValues }) {
  const { lg } = useBreakpoint();

  const columnsTypen: Columns[] = [
    { type: "text", title: "Name", required: true, dataIndex: "name", width: "150px" },
    { type: "boolean", title: "Master", dataIndex: "mod" },
    { type: "boolean", title: "Kasse1", dataIndex: "kasseV" },
    { type: "boolean", title: "Kasse2", dataIndex: "kasse" },
    { type: "boolean", title: "Tech1", dataIndex: "technikerV" },
    { type: "boolean", title: "Tech2", dataIndex: "techniker" },
    { type: "boolean", title: "Merch", dataIndex: "merchandise" },
    { type: "color", title: "Farbe", dataIndex: "color" },
  ];

  const columnsPreisprofile: Columns[] = [
    { type: "text", title: "Name", required: true, dataIndex: "name" },
    { type: "integer", title: "Regulär", required: true, dataIndex: "regulaer", min: 0 },
    { type: "integer", title: "Rabatt ermäßigt", required: true, dataIndex: "rabattErmaessigt", width: "120px", min: 0, initialValue: 0 },
    { type: "integer", title: "Rabatt Mitglied", required: true, dataIndex: "rabattMitglied", width: "120px", min: 0, initialValue: 0 },
  ];

  return (
    <>
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <Collapsible suffix="allgemeines" label="Typen" noTopBorder>
            <EditableTable<{
              name: string;
              mod: boolean;
              kasseV: boolean;
              kasse: boolean;
              technikerV: boolean;
              techniker: boolean;
              merchandise: boolean;
              color: string;
            }>
              columnDescriptions={columnsTypen}
              name="typenPlus"
              newRowFactory={(val) => {
                return Object.assign({}, val);
              }}
            />
          </Collapsible>
          <Collapsible suffix="allgemeines" label="Optionen">
            <MultiSelectWithTags name="kooperationen" label={"Kooperationen"} options={optionen.kooperationen} />
            <MultiSelectWithTags name="genres" label={"Genres"} options={optionen.genres} />
          </Collapsible>
        </Col>
        <Col xs={24} lg={12}>
          <Collapsible suffix="ausgaben" label="Preisprofile" noTopBorder={lg}>
            <p>
              <b>Achtung! Änderungen hier wirken sich NICHT auf bereits angelegte Veranstaltungen aus!</b>
            </p>
            <EditableTable<{ name: string; regulaer: number; rabattErmaessigt: number; rabattMitglied: number }>
              columnDescriptions={columnsPreisprofile}
              name="preisprofile"
              newRowFactory={(val) => {
                return Object.assign({ regulaer: 0, rabattErmaessigt: 0, rabattMitglied: 0 }, val);
              }}
            />
          </Collapsible>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <Collapsible suffix="technik" label="Backlines">
            <MultiSelectWithTags name="backlineJazzclub" label={"Jazzclub"} options={optionen.backlineJazzclub} />
            <MultiSelectWithTags name="backlineRockshop" label={"Rockshop"} options={optionen.backlineRockshop} />
          </Collapsible>
        </Col>
      </Row>
    </>
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

  function TabLabel({ title, type }: { type: string; title: string }) {
    const { color } = colorsAndIconsForSections;
    const active = activePage === type;
    const farbe = color("allgemeines");
    return <b style={{ margin: -16, padding: 16, backgroundColor: active ? farbe : "inherit", color: active ? "#FFF" : farbe }}>{title}</b>;
  }

  const tabs: TabsProps["items"] = [
    {
      key: "optionen",
      label: <TabLabel type="optionen" title="Optionen" />,
      children: <TabOptionen optionen={data ?? new OptionValues()} />,
    },
    {
      key: "artists",
      label: <TabLabel type="artists" title="Künstler" />,
      children: (
        <Row gutter={12}>
          <Col span={24}>
            <Collapsible suffix="allgemeines" label="Künstler" noTopBorder>
              <MultiSelectWithTags name="artists" label={"Künstler"} options={data?.artists ?? []} />
            </Collapsible>
          </Col>
        </Row>
      ),
    },
  ];

  function saveForm(vals: OptionValues) {
    mutateOptionen.mutate(new OptionValues(vals));
  }

  return (
    <JazzFormAndHeader<OptionValues> title="Optionen" data={data} saveForm={saveForm} resetChanges={refetch}>
      <Tabs type="card" activeKey={activePage} items={tabs} onChange={setActivePage} />
    </JazzFormAndHeader>
  );
}
