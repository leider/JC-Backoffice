import { Col, Row } from "antd";
import React from "react";
import TechnikCard from "@/components/vermietung/technik/TechnikCard.tsx";

export default function TabTechnik() {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <TechnikCard />
      </Col>
    </Row>
  );
}
