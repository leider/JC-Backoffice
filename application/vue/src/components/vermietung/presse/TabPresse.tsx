import { Col, Row } from "antd";
import React, { useContext } from "react";
import PresseCard from "@/components/veranstaltung/presse/PresseCard.tsx";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";

export default function TabPresse() {
  const mietContext = useContext(VermietungContext);
  const form = mietContext!.form;

  return (
    <Row gutter={12}>
      <Col span={24}>
        <PresseCard form={form} isVermietung={true} />
      </Col>
    </Row>
  );
}
