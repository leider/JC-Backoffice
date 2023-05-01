import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, FormInstance, Row, Table } from "antd";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import VeranstaltungKalkulation from "jc-shared/veranstaltung/veranstaltungKalkulation";
import { ColumnsType } from "antd/es/table";
import { formatToGermanNumberString } from "@/commons/utilityFunctions";

interface AusgabenCardParams {
  einnahmen: number;
  ausgaben: number;
  form: FormInstance<Veranstaltung>;
}
export default function EinAusCard({ einnahmen, ausgaben, form }: AusgabenCardParams) {
  const [kalk, setKalk] = useState<VeranstaltungKalkulation | undefined>(undefined);
  useEffect(() => {
    updateKalk();
  }, [einnahmen, ausgaben, form]);

  function updateKalk() {
    const veranst = new Veranstaltung(form.getFieldsValue(true));
    const kalk = new VeranstaltungKalkulation(veranst);
    setKalk(kalk);
  }
  function format(amount: number): string {
    return `${formatToGermanNumberString(amount)} €`;
  }

  const columns: ColumnsType = [
    { title: "", dataIndex: "first", key: "first", render: (text) => <b>{text}</b>, align: "right" },
    { title: "Einnahmen", dataIndex: "second", key: "second", align: "right" },
    { title: "Ausgaben", dataIndex: "third", key: "third", align: "right" },
    { title: "Überschuss", dataIndex: "fourth", key: "fourth", align: "right" },
  ];

  const data = [
    {
      key: 1,
      first: "",
      second: format(kalk?.einnahmenGesamtEUR || 0),
      third: format(kalk?.kostenGesamtEUR || 0),
      fourth: format(kalk?.bruttoUeberschussEUR || 0),
    },
    {
      key: 2,
      first: "Anteilig an Band:",
      second: "",
      third: "",
      fourth: format(kalk?.dealAbsolutEUR || 0),
    },
  ];

  return (
    <CollapsibleForVeranstaltung suffix="concert" label="Kostenübersicht / Break-Even" amount={kalk?.dealUeberschussTotal}>
      <Row gutter={12}>
        <Col span={24}>
          <Table columns={columns} dataSource={data} size="small" pagination={false} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
