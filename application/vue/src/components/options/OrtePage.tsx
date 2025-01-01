import { useQuery } from "@tanstack/react-query";
import { orte as orteLoader, saveOrte } from "@/commons/loader.ts";
import * as React from "react";
import { Col, Row } from "antd";
import Orte from "jc-shared/optionen/orte";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import EditableTable from "@/widgets/EditableTable/EditableTable";
import { Columns } from "@/widgets/EditableTable/types.ts";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";

function OrtePageInternal() {
  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", width: "20%", required: true, uniqueValues: true },
    { dataIndex: "flaeche", title: "Fläche", type: "integer", required: true },
    { dataIndex: "pressename", title: "Für Presse", type: "text", width: "30%", required: true },
    { dataIndex: "presseIn", title: 'Für Presse mit "in"', type: "text", width: "30%", required: true },
  ];

  return (
    <RowWrapper>
      <Row gutter={12}>
        <Col span={24}>
          <EditableTable<{ name: string; flaeche: number; pressename: string; presseIn: string }>
            columnDescriptions={columnDescriptions}
            name="orte"
            newRowFactory={(val) => Object.assign({ flaeche: 0 }, val)}
          />
        </Col>
      </Row>
    </RowWrapper>
  );
}

export default function OrtePage() {
  const { data, refetch } = useQuery({
    queryKey: ["orte"],
    queryFn: orteLoader,
  });

  const mutateOrte = useJazzMutation({
    saveFunction: saveOrte,
    queryKey: "orte",
    successMessage: "Die Orte wurden gespeichert",
  });

  function saveForm(vals: Orte) {
    mutateOrte.mutate(new Orte(vals));
  }

  return (
    <JazzFormAndHeader<Orte> title="Orte" data={data} saveForm={saveForm} resetChanges={refetch}>
      <OrtePageInternal />
    </JazzFormAndHeader>
  );
}
