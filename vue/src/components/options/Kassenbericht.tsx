import { PageHeader } from "@ant-design/pro-layout";
import { uploadBeleg } from "@/commons/loader-for-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Button, Col, DatePicker, Form, Row, Upload, UploadFile, UploadProps } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { RcFile } from "antd/es/upload";
import { SaveButton } from "@/components/colored/JazzButtons";

export default function Kassenbericht() {
  const [monate, setMonate] = useState<DatumUhrzeit[]>([]);

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
      <Col span={12}>
        <PageHeader title="Kassenberichte" />
        {monate.map((monat) => (
          <p key={monat.monatJahrKompakt}>
            <a href={"/kassenbericht/" + monat.fuerKalenderViews} target="_blank">
              Kassenbericht {monat.monatJahrKompakt}
            </a>
          </p>
        ))}
      </Col>
    </Row>
  );
}
