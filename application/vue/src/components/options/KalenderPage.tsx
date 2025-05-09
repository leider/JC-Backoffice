import { useQuery } from "@tanstack/react-query";
import { kalender, saveKalender } from "@/rest/loader.ts";
import * as React from "react";
import FerienIcals, { Ical } from "jc-shared/optionen/ferienIcals";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import { Col } from "antd";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useCallback } from "react";

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

  const newIcalFactory = useCallback((vals: Ical) => Object.assign({}, vals), []);
  return (
    <JazzRow>
      <Col span={24}>
        <EditableTable<Ical> columnDescriptions={columnDescriptions} name="icals" newRowFactory={newIcalFactory} />
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

  const saveForm = useCallback((vals: FerienIcals) => mutateKalender.mutate(new FerienIcals(vals)), [mutateKalender]);

  return (
    <JazzFormAndHeader<FerienIcals> data={data} resetChanges={refetch} saveForm={saveForm} title="Kalender">
      <KalenderPageInternal />
    </JazzFormAndHeader>
  );
}
