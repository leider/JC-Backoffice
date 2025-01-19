import { Col } from "antd";
import React from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Collapsible from "@/widgets/Collapsible.tsx";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { NameWithNumber } from "jc-shared/konzert/konzert.ts";
import { Columns } from "@/widgets/EditableTable/types.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

const columns: Columns[] = [
  { type: "text", title: "Name", required: true, dataIndex: "name", width: "40%" },
  { type: "text", title: "Kommentar", dataIndex: "comment" },
  { type: "integer", title: "Anzahl", required: true, dataIndex: "number" },
  { type: "integer", title: "Erledigt", required: true, dataIndex: "alreadyIn" },
];

function GaesteCard({ label, path }: { label: string; path: string }) {
  const { lg } = useBreakpoint();
  return (
    <Collapsible suffix="gaeste" label={label} noTopBorder={label === "gaesteliste" || lg}>
      <JazzRow>
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
      </JazzRow>
    </Collapsible>
  );
}

export default function TabGaeste() {
  return (
    <JazzRow>
      <Col xs={24} lg={12}>
        <GaesteCard label="Gästeliste" path="gaesteliste" />
      </Col>
      <Col xs={24} lg={12}>
        <GaesteCard label="Reservierungen" path="reservierungen" />
      </Col>
    </JazzRow>
  );
}
