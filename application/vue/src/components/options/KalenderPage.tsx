import { useQuery } from "@tanstack/react-query";
import { kalender, saveKalender } from "@/commons/loader.ts";
import * as React from "react";
import FerienIcals, { Ical } from "jc-shared/optionen/ferienIcals";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import { Col } from "antd";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

function KalenderPageInternal() {
  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", width: "20%", required: true, uniqueValues: true },
    { dataIndex: "url", title: "URL", type: "text", required: true, uniqueValues: true },
    {
      dataIndex: "typ",
      title: "Typ",
      type: "text",
      width: "120px",
      required: true,
      filters: ["Sonstiges", "Feiertag", "Ferien", "Vermietung"],
    },
  ];

  return (
    <JazzRow>
      <Col span={24}>
        <EditableTable<Ical> columnDescriptions={columnDescriptions} name="icals" newRowFactory={(vals) => Object.assign({}, vals)} />
      </Col>
    </JazzRow>
  );
}

export default function KalenderPage() {
  const { data, refetch } = useQuery<FerienIcals>({ queryKey: ["ferienIcals"], queryFn: kalender });

  const mutateKalender = useJazzMutation({
    saveFunction: saveKalender,
    queryKey: "ferienIcals",
    successMessage: "Die Kalender wurden gespeichert",
  });

  function saveForm(vals: FerienIcals) {
    mutateKalender.mutate(new FerienIcals(vals));
  }

  return (
    <JazzFormAndHeader<FerienIcals> data={data} resetChanges={refetch} saveForm={saveForm} title="Kalender">
      <KalenderPageInternal />
    </JazzFormAndHeader>
  );
}
