import { Col, Row } from "antd";
import React, { useState } from "react";
import EinnahmenCard from "@/components/veranstaltung/kosten/EinnahmenCard";
import AusgabenCard from "@/components/veranstaltung/kosten/AusgabenCard";
import EinAusCard from "@/components/veranstaltung/kosten/EinAusCard";

export default function TabKosten() {
  const [einnahmen, setEinnahmen] = useState<number>(0);
  const [ausgaben, setAusgaben] = useState<number>(0);
  function einnahmenChanged(sum: number) {
    setEinnahmen(sum);
  }

  function ausgabenChanged(sum: number) {
    setAusgaben(sum);
  }

  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EinnahmenCard onChange={einnahmenChanged} />
        <EinAusCard ausgaben={ausgaben} einnahmen={einnahmen} />
      </Col>
      <Col xs={24} lg={12}>
        <AusgabenCard onChange={ausgabenChanged} />
      </Col>
    </Row>
  );
}
