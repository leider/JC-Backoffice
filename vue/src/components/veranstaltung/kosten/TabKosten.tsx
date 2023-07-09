import { Col, Row } from "antd";
import React, { useState } from "react";
import EinnahmenCard from "@/components/veranstaltung/kosten/EinnahmenCard";
import AusgabenCard from "@/components/veranstaltung/kosten/AusgabenCard";
import EinAusCard from "@/components/veranstaltung/kosten/EinAusCard";
import { TabProps } from "@/components/veranstaltung/VeranstaltungTabs";

export default function TabKosten({ veranstaltung, optionen, form }: TabProps) {
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
        <EinnahmenCard veranstaltung={veranstaltung!} optionen={optionen!} form={form} onChange={einnahmenChanged} />
        <EinAusCard form={form} ausgaben={ausgaben} einnahmen={einnahmen} />
      </Col>
      <Col xs={24} lg={12}>
        <AusgabenCard veranstaltung={veranstaltung!} optionen={optionen!} form={form} onChange={ausgabenChanged} />
      </Col>
    </Row>
  );
}
