import { Col, Row } from "antd";
import React from "react";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard";

export default function TabTechnik() {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <TechnikCard />
      </Col>
    </Row>
  );
}
