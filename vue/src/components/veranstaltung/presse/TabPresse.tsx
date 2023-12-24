import { Col, Row } from "antd";
import React, { useContext } from "react";
import PresseCard from "@/components/veranstaltung/presse/PresseCard.tsx";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";

export default function TabPresse() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  return (
    <Row gutter={12}>
      <Col span={24}>
        <PresseCard form={form} isVermietung={false} />
      </Col>
    </Row>
  );
}
