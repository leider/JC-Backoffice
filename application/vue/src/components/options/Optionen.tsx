import { useQuery } from "@tanstack/react-query";
import { optionen as optionenLoader, saveOptionen } from "@/commons/loader.ts";
import * as React from "react";
import { useState } from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import { Col, Tabs, TabsProps } from "antd";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import Collapsible from "@/widgets/Collapsible.tsx";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import JazzFormAndHeader from "../content/JazzFormAndHeader";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";

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
    { type: "text", title: "Name", required: true, dataIndex: "name", uniqueValues: true },
    { type: "integer", title: "Regulär", required: true, dataIndex: "regulaer", min: 0 },
    { type: "integer", title: "Rabatt ermäßigt", required: true, dataIndex: "rabattErmaessigt", width: "120px", min: 0, initialValue: 0 },
    { type: "integer", title: "Rabatt Mitglied", required: true, dataIndex: "rabattMitglied", width: "120px", min: 0, initialValue: 0 },
  ];

  return (
    <>
      <JazzRow>
        <Col lg={12} xs={24}>
          <Collapsible label="Typen" noTopBorder suffix="allgemeines">
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
          <Collapsible label="Optionen" suffix="allgemeines">
            <MultiSelectWithTags label="Kooperationen" name="kooperationen" options={optionen.kooperationen} />
            <MultiSelectWithTags label="Genres" name="genres" options={optionen.genres} />
            <NumberInput decimals={2} label="Standardpreis Klavierstimmer" name="preisKlavierstimmer" suffix="€" />
            <p>
              <b>
                Achtung! Änderungen am Preis wirken sich NICHT auf bereits angelegte Veranstaltungen aus, die einen Preis gesetzt haben!
              </b>
            </p>
          </Collapsible>
        </Col>
        <Col lg={12} xs={24}>
          <Collapsible label="Preisprofile" noTopBorder={lg} suffix="ausgaben">
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
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <Collapsible label="Backlines" suffix="technik">
            <MultiSelectWithTags label="Jazzclub" name="backlineJazzclub" options={optionen.backlineJazzclub} />
            <MultiSelectWithTags label="Rockshop" name="backlineRockshop" options={optionen.backlineRockshop} />
          </Collapsible>
        </Col>
      </JazzRow>
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

  const tabs: TabsProps["items"] = [
    {
      key: "optionen",
      label: <TabLabel title="Optionen" type="optionen" />,
      children: <TabOptionen optionen={data ?? new OptionValues()} />,
    },
    {
      key: "artists",
      label: <TabLabel title="Künstler" type="artists" />,
      children: (
        <JazzRow>
          <Col span={24}>
            <Collapsible label="Künstler" noTopBorder suffix="allgemeines">
              <MultiSelectWithTags label="Künstler" name="artists" options={data?.artists ?? []} />
            </Collapsible>
          </Col>
        </JazzRow>
      ),
    },
  ];

  function saveForm(vals: OptionValues) {
    mutateOptionen.mutate(new OptionValues(vals));
  }

  return (
    <JazzFormAndHeader<OptionValues> data={data} resetChanges={refetch} saveForm={saveForm} title="Optionen">
      <Tabs activeKey={activePage} items={tabs} onChange={setActivePage} type="card" />
    </JazzFormAndHeader>
  );
}
