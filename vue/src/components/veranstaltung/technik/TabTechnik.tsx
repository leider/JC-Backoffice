import { Col, Row } from "antd";
import React from "react";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard";
// import RiderCard from "@/components/veranstaltung/technik/RiderCard.tsx";

export default function TabTechnik() {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <TechnikCard />
        {/*<RiderCard />*/}
      </Col>
    </Row>
  );
}
