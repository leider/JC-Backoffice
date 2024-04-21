import { Col, Row } from "antd";
import React from "react";
import EinnahmenCard from "@/components/vermietung/kosten/EinnahmenCard.tsx";
import AusgabenCard from "@/components/vermietung/kosten/AusgabenCard.tsx";

export default function TabKosten() {
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EinnahmenCard />
      </Col>
      <Col xs={24} lg={12}>
        <AusgabenCard />
      </Col>
    </Row>
  );
}
