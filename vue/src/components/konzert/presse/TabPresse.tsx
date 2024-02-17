import { Col, Row } from "antd";
import React, { useContext } from "react";
import PresseCard from "@/components/veranstaltung/presse/PresseCard.tsx";
import { KonzertContext } from "@/components/konzert/KonzertComp.tsx";

export default function TabPresse() {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;

  return (
    <Row gutter={12}>
      <Col span={24}>
        <PresseCard form={form} isVermietung={false} />
      </Col>
    </Row>
  );
}
