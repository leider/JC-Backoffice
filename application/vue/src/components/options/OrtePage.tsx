import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveOrte } from "@/commons/loader.ts";
import * as React from "react";
import { Col, Row } from "antd";
import Orte from "jc-shared/optionen/orte";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable";
import { Columns } from "@/widgets/EditableTable/types.ts";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { useState } from "react";
import cloneDeep from "lodash/cloneDeep";

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
  const { orte: originalOrte, showSuccess } = useJazzContext();
  const [orte, setOrte] = useState(originalOrte);
  const queryClient = useQueryClient();

  const mutateOrte = useMutation({
    mutationFn: saveOrte,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orte"] });
      showSuccess({ text: "Die Orte wurden gespeichert" });
    },
  });

  function saveForm(vals: Orte) {
    mutateOrte.mutate(new Orte(vals));
  }

  function reload() {
    setOrte(cloneDeep(originalOrte));
  }

  return (
    <JazzFormAndHeader<Orte> title="Orte" data={orte} saveForm={saveForm} resetChanges={reload}>
      <OrtePageInternal />
    </JazzFormAndHeader>
  );
}
