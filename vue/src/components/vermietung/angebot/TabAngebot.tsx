import { Col, Row } from "antd";
import React from "react";
import AngebotCard from "@/components/vermietung/angebot/AngebotCard.tsx";
import InfoCard from "@/components/vermietung/angebot/InfoCard.tsx";

export default function TabAngebot() {
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <AngebotCard />
      </Col>
      <Col xs={24} lg={12}>
        <InfoCard />
      </Col>
    </Row>
  );
}
