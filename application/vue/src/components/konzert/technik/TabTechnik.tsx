import { Col, Row } from "antd";
import React from "react";
import TechnikCard from "@/components/konzert/technik/TechnikCard";
import RiderCard from "@/components/konzert/technik/RiderCard.tsx";

export default function TabTechnik() {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <TechnikCard />
        <RiderCard />
      </Col>
    </Row>
  );
}
