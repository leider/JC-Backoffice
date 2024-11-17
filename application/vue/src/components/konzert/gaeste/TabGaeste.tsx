import { Col, Row } from "antd";
import React, { useContext } from "react";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import Collapsible from "@/widgets/Collapsible.tsx";

const columns: CollectionColDesc[] = [
  { type: "text", label: "Name", required: true, fieldName: "name", width: "l" },
  { type: "text", label: "Kommentar", fieldName: "comment", width: "l" },
  { type: "integer", label: "Anzahl", required: true, fieldName: "number", width: "xs", initialValue: 1 },
  { type: "integer", label: "Erledigt", required: true, fieldName: "alreadyIn", width: "xs", initialValue: 0 },
];

function GaesteCard({ label, path }: { label: string; path: string }) {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;
  const { lg } = useBreakpoint();
  return (
    <Collapsible suffix="gaeste" label={label} noTopBorder={label === "gaesteliste" || lg}>
      <Row gutter={12}>
        <Col span={24}>
          <InlineCollectionEditable embeddedArrayPath={[path]} form={form} columnDescriptions={columns} />
        </Col>
      </Row>
    </Collapsible>
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
