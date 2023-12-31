import { Col, Row } from "antd";
import React, { useContext } from "react";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";

const columns: CollectionColDesc[] = [
  { type: "text", label: "Name", required: true, fieldName: "name", width: "l" },
  { type: "text", label: "Kommentar", fieldName: "comment", width: "l" },
  { type: "integer", label: "Anzahl", required: true, fieldName: "number", width: "xs", initialValue: 1 },
  { type: "integer", label: "Erledigt", required: true, fieldName: "alreadyIn", width: "xs", initialValue: 0 },
];

function GaesteCard({ label, path }: { label: string; path: string }) {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;
  const { lg } = useBreakpoint();
  return (
    <CollapsibleForVeranstaltung suffix="gaeste" label={label} noTopBorder={label === "gaesteliste" || lg}>
      <Row gutter={12}>
        <Col span={24}>
          <InlineCollectionEditable embeddedArrayPath={[path]} form={form} columnDescriptions={columns} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}

export default function TabGaeste() {
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <GaesteCard label="Gästeliste" path="gaesteliste" />
      </Col>
      <Col xs={24} lg={12}>
        <GaesteCard label="Reservierungen" path="reservierungen" />
      </Col>
    </Row>
  );
}
