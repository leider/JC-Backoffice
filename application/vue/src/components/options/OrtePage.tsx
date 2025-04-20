import { useQuery } from "@tanstack/react-query";
import { orte as orteLoader, saveOrte } from "@/rest/loader.ts";
import * as React from "react";
import { Col } from "antd";
import Orte, { Ort } from "jc-shared/optionen/orte";
import EditableTable from "@/widgets/EditableTable/EditableTable";
import { Columns } from "@/widgets/EditableTable/types.ts";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { JazzRow } from "@/widgets/JazzRow";
import { useCallback } from "react";

function OrtePageInternal() {
  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", width: "20%", required: true, uniqueValues: true },
    { dataIndex: "flaeche", title: "Fläche", type: "integer", required: true },
    { dataIndex: "pressename", title: "Für Presse", type: "text", width: "30%", required: true },
    { dataIndex: "presseIn", title: 'Für Presse mit "in"', type: "text", width: "30%", required: true },
  ];

  const newOrtFactory = useCallback((val: Ort) => Object.assign({ flaeche: 0 }, val), []);

  return (
    <JazzRow>
      <Col span={24}>
        <EditableTable<Ort> columnDescriptions={columnDescriptions} name="orte" newRowFactory={newOrtFactory} />
      </Col>
    </JazzRow>
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

  const saveForm = useCallback((vals: Orte) => mutateOrte.mutate(new Orte(vals)), [mutateOrte]);

  return (
    <JazzFormAndHeader<Orte> data={data} resetChanges={refetch} saveForm={saveForm} title="Orte">
      <OrtePageInternal />
    </JazzFormAndHeader>
  );
}
