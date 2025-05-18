import { Col } from "antd";
import React from "react";
import EinnahmenCard from "@/components/vermietung/kosten/EinnahmenCard.tsx";
import AusgabenCard from "@/components/vermietung/kosten/AusgabenCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

export default function TabKosten() {
  return (
    <ScrollingContent>
      <JazzRow>
        <Col lg={12} xs={24}>
          <EinnahmenCard />
        </Col>
        <Col lg={12} xs={24}>
          <AusgabenCard />
        </Col>
      </JazzRow>
    </ScrollingContent>
  );
}
