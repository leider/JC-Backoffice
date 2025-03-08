import { Col } from "antd";
import React, { useState } from "react";
import EinnahmenCard from "@/components/konzert/kosten/EinnahmenCard";
import AusgabenCard from "@/components/konzert/kosten/AusgabenCard";
import EinAusCard from "@/components/konzert/kosten/EinAusCard";
import { JazzRow } from "@/widgets/JazzRow.tsx";

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
    <JazzRow>
      <Col lg={12} xs={24}>
        <EinnahmenCard onChange={einnahmenChanged} />
        <EinAusCard ausgaben={ausgaben} einnahmen={einnahmen} />
      </Col>
      <Col lg={12} xs={24}>
        <AusgabenCard onChange={ausgabenChanged} />
      </Col>
    </JazzRow>
  );
}
