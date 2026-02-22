import * as React from "react";
import { useCallback, useEffect } from "react";
import { Col } from "antd";
import Collapsible from "@/widgets/Collapsible.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { JazzColumn } from "@/widgets/EditableTable/types.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import useCheckErrors from "@/commons/useCheckErrors.ts";
import Kontakt from "jc-shared/veranstaltung/kontakt";
import { Hotelpreise } from "jc-shared/optionen/optionValues.ts";

export default function TabHotels() {
  const form = useFormInstance();
  const { checkErrors } = useCheckErrors(form, true);
  useEffect(() => {
    checkErrors();
  }, [checkErrors]);

  const columnsPreise: JazzColumn[] = [
    { type: "text", title: "Name", required: true, dataIndex: "name", uniqueValues: true, width: "120px" },
    { type: "twoDecimals", title: "Einzel", required: true, dataIndex: "einzelEUR", min: 0, width: "120px" },
    { type: "twoDecimals", title: "Doppel", required: true, dataIndex: "doppelEUR", min: 0, width: "120px" },
    { type: "twoDecimals", title: "Suite", required: true, dataIndex: "suiteEUR", min: 0, width: "120px" },
  ];

  const columnsAdresse: JazzColumn[] = [
    { type: "text", title: "Name", required: true, dataIndex: "name", uniqueValues: true, width: "120px" },
    { type: "text", title: "Adresse", dataIndex: "adresse", multiline: true, width: "120px" },
    { type: "text", title: "E-Mail", dataIndex: "email", width: "180px" },
    { type: "text", title: "Telefon", dataIndex: "telefon", width: "120px" },
    { type: "text", title: "Ansprechpartner", dataIndex: "ansprechpartner", width: "140px" },
  ];

  const newKontaktFactory = useCallback((val: Kontakt) => Object.assign({}, val), []);
  const newPreiseFactory = useCallback((val: Hotelpreise) => Object.assign({}, val), []);

  return (
    <JazzRow>
      <Col lg={12} xs={24}>
        <Collapsible label="Hotels" noTopBorder suffix="allgemeines">
          <EditableTable<Kontakt> columnDescriptions={columnsAdresse} name="hotels" newRowFactory={newKontaktFactory} />
        </Collapsible>
        <Collapsible label="Hotelpreise" suffix="allgemeines">
          <EditableTable<Hotelpreise> columnDescriptions={columnsPreise} name="hotelpreise" newRowFactory={newPreiseFactory} />
        </Collapsible>
      </Col>
      <Col lg={12} xs={24}>
        <Collapsible label="Agenturen" noTopBorder suffix="allgemeines">
          <EditableTable<Kontakt> columnDescriptions={columnsAdresse} name="agenturen" newRowFactory={newKontaktFactory} />
        </Collapsible>
      </Col>
    </JazzRow>
  );
}
