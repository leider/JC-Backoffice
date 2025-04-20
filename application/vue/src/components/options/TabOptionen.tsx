import * as React from "react";
import OptionValues, { Preisprofil, TypMitMehr } from "jc-shared/optionen/optionValues";
import { Col } from "antd";
import Collapsible from "@/widgets/Collapsible.tsx";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { useCallback, useMemo } from "react";

export default function TabOptionen() {
  const { lg } = useBreakpoint();
  const form = useFormInstance<OptionValues>();
  const optionen = useMemo(() => form.getFieldsValue(true), [form]);

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

  const typMitMehrFactory = useCallback((val: TypMitMehr) => Object.assign({}, val), []);
  const preisProfilFactory = useCallback((val: Preisprofil) => {
    return Object.assign({ regulaer: 0, rabattErmaessigt: 0, rabattMitglied: 0 }, val);
  }, []);

  return (
    <>
      <JazzRow>
        <Col lg={12} xs={24}>
          <Collapsible label="Typen" noTopBorder suffix="allgemeines">
            <EditableTable<TypMitMehr> columnDescriptions={columnsTypen} name="typenPlus" newRowFactory={typMitMehrFactory} />
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
            <EditableTable<Preisprofil> columnDescriptions={columnsPreisprofile} name="preisprofile" newRowFactory={preisProfilFactory} />
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
