import { Col, Row } from "antd";
import React from "react";
import PresseCard from "@/components/vermietung/presse/PresseCard.tsx";

export default function TabPresse() {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <PresseCard />
      </Col>
    </Row>
  );
}
