import { Col, Row } from "antd";
import React from "react";
import { VermietungTabProps } from "@/components/vermietung/VermietungTabs.tsx";
import EinnahmenCard from "@/components/vermietung/kosten/EinnahmenCard.tsx";
import AusgabenCard from "@/components/vermietung/kosten/AusgabenCard.tsx";

export default function TabKosten({ form }: VermietungTabProps) {
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EinnahmenCard form={form!} />
      </Col>
      <Col xs={24} lg={12}>
        <AusgabenCard form={form!} />
      </Col>
    </Row>
  );
}
