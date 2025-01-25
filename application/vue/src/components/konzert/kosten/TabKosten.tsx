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
      <Col xs={24} lg={12}>
        <EinnahmenCard onChange={einnahmenChanged} />
        <EinAusCard ausgaben={ausgaben} einnahmen={einnahmen} />
      </Col>
      <Col xs={24} lg={12}>
        <AusgabenCard onChange={ausgabenChanged} />
      </Col>
    </JazzRow>
  );
}
