import { Col } from "antd";
import React from "react";
import EinnahmenCard from "@/components/vermietung/kosten/EinnahmenCard.tsx";
import AusgabenCard from "@/components/vermietung/kosten/AusgabenCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";

export default function TabKosten() {
  return (
    <JazzRow>
      <Col xs={24} lg={12}>
        <EinnahmenCard />
      </Col>
      <Col xs={24} lg={12}>
        <AusgabenCard />
      </Col>
    </JazzRow>
  );
}
