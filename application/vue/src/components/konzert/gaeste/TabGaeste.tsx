import { Col } from "antd";
import React, { useCallback } from "react";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import Collapsible from "@/widgets/Collapsible.tsx";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { NameWithNumber } from "jc-shared/konzert/konzert.ts";
import { JazzColumn } from "@/widgets/EditableTable/types.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

const columns: JazzColumn[] = [
  { type: "text", title: "Name", required: true, dataIndex: "name", width: "120px" },
  { type: "text", title: "Kommentar", dataIndex: "comment", width: "200px" },
  { type: "integer", title: "Anzahl", required: true, dataIndex: "number", width: "60px" },
  { type: "integer", title: "Erledigt", required: true, dataIndex: "alreadyIn", width: "60px" },
];

const smallColumns: JazzColumn[] = [
  { type: "text", title: "Name", required: true, dataIndex: "name", width: "40%" },
  { type: "integer", title: "Anzahl", required: true, dataIndex: "number" },
  { type: "integer", title: "Erledigt", required: true, dataIndex: "alreadyIn" },
];

function GaesteCard({ label, path }: { readonly label: string; readonly path: string }) {
  const { lg, sm } = useBreakpoint();
  const newRowFactory = useCallback((vals: NameWithNumber) => {
    return Object.assign(
      {
        name: null,
        comment: null,
        number: 1,
        alreadyIn: 0,
      },
      vals,
    );
  }, []);
  return (
    <Collapsible label={label} noTopBorder={label === "gaesteliste" || lg} suffix="gaeste">
      <JazzRow>
        <Col span={24}>
          <EditableTable<NameWithNumber> columnDescriptions={sm ? columns : smallColumns} name={path} newRowFactory={newRowFactory} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}

export default function TabGaeste({ inModal = false }: { readonly inModal?: boolean }) {
  return (
    <ScrollingContent>
      <JazzRow>
        <Col lg={inModal ? 24 : 12} xs={24}>
          <GaesteCard label="Gästeliste" path="gaesteliste" />
        </Col>
        <Col lg={inModal ? 24 : 12} xs={24}>
          <GaesteCard label="Reservierungen" path="reservierungen" />
        </Col>
      </JazzRow>
    </ScrollingContent>
  );
}
