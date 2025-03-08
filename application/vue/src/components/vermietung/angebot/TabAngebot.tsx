import { Col } from "antd";
import React from "react";
import AngebotCard from "@/components/vermietung/angebot/AngebotCard.tsx";
import InfoCard from "@/components/vermietung/angebot/InfoCard.tsx";
import ZusaetzlicheInfosCard from "@/components/vermietung/angebot/ZusaetzlicheInfosCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";

export default function TabAngebot() {
  return (
    <JazzRow>
      <Col lg={12} xs={24}>
        <AngebotCard />
      </Col>
      <Col lg={12} xs={24}>
        <ZusaetzlicheInfosCard />
        <InfoCard />
      </Col>
    </JazzRow>
  );
}
