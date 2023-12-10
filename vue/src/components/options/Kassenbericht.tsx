import { PageHeader } from "@ant-design/pro-layout";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Row } from "antd";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";

export default function Kassenbericht() {
  const [monate, setMonate] = useState<DatumUhrzeit[]>([]);

  document.title = "Kassenbericht";

  useEffect(() => {
    const result: DatumUhrzeit[] = [];
    let current = new DatumUhrzeit().minus({ monate: 6 });
    for (let i = 0; i < 12; i++) {
      result.push(current);
      current = current.plus({ monate: 1 });
    }
    setMonate(result);
  }, []);

  return (
    <Row gutter={12}>
      <Col span={24}>
        <PageHeader title="Kassenberichte" />
        {monate.map((monat) => (
          <p key={monat.monatJahrKompakt}>
            <a href={"/pdf/kassenbericht/" + monat.fuerKalenderViews} target="_blank">
              Kassenbericht {monat.monatJahrKompakt}
            </a>
          </p>
        ))}
      </Col>
    </Row>
  );
}
