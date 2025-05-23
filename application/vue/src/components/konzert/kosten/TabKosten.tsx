import { Col } from "antd";
import React from "react";
import EinnahmenCard from "@/components/konzert/kosten/EinnahmenCard";
import AusgabenCard from "@/components/konzert/kosten/AusgabenCard";
import EinAusCard from "@/components/konzert/kosten/EinAusCard";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

export default function TabKosten() {
  return (
    <ScrollingContent>
      <JazzRow>
        <Col lg={12} xs={24}>
          <EinnahmenCard />
          <EinAusCard />
        </Col>
        <Col lg={12} xs={24}>
          <AusgabenCard />
        </Col>
      </JazzRow>
    </ScrollingContent>
  );
}
