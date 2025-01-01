import { useQuery } from "@tanstack/react-query";
import { kalender, saveKalender } from "@/commons/loader.ts";
import * as React from "react";
import FerienIcals, { Ical } from "jc-shared/optionen/ferienIcals";
import JazzFormAndHeader from "@/components/content/JazzFormAndHeader.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { Col, Row } from "antd";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { useJazzMutation } from "@/commons/useJazzMutation.ts";

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
    <RowWrapper>
      <Row gutter={12}>
        <Col span={24}>
          <EditableTable<Ical> columnDescriptions={columnDescriptions} name="icals" newRowFactory={(vals) => Object.assign({}, vals)} />
        </Col>
      </Row>
    </RowWrapper>
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
    <JazzFormAndHeader<FerienIcals> title="Kalender" data={data} saveForm={saveForm} resetChanges={refetch}>
      <KalenderPageInternal />
    </JazzFormAndHeader>
  );
}
