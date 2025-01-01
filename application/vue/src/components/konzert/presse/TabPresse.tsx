import { Col, Row } from "antd";
import React from "react";
import PresseCard from "@/components/veranstaltung/presse/PresseCard.tsx";

export default function TabPresse() {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <PresseCard isVermietung={false} />
      </Col>
    </Row>
  );
}
