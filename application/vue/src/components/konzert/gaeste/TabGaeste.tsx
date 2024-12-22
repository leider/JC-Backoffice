import { Col, Row } from "antd";
import React from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { CollectionColDesc } from "@/widgets/InlineCollectionEditable";
import Collapsible from "@/widgets/Collapsible.tsx";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { NameWithNumber } from "jc-shared/konzert/konzert.ts";

const columns: CollectionColDesc[] = [
  { type: "text", label: "Name", required: true, fieldName: "name", width: "l" },
  { type: "text", label: "Kommentar", fieldName: "comment", width: "l" },
  { type: "integer", label: "Anzahl", required: true, fieldName: "number", width: "xs" },
  { type: "integer", label: "Erledigt", required: true, fieldName: "alreadyIn", width: "xs" },
];

function GaesteCard({ label, path }: { label: string; path: string }) {
  const { lg } = useBreakpoint();
  return (
    <Collapsible suffix="gaeste" label={label} noTopBorder={label === "gaesteliste" || lg}>
      <Row gutter={12}>
        <Col span={24}>
          <EditableTable<NameWithNumber>
            name={path}
            columnDescriptions={columns}
            newRowFactory={(vals) => {
              return Object.assign(
                {
                  name: null,
                  comment: null,
                  number: 1,
                  alreadyIn: 0,
                },
                vals,
              );
            }}
          />
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
