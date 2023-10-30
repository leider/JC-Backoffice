import { Col, Row } from "antd";
import React from "react";
import PresseCard from "@/components/veranstaltung/presse/PresseCard";

export default function TabPresse() {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <PresseCard />
      </Col>
    </Row>
  );
}
