import { Col } from "antd";
import React from "react";
import AngebotCard from "@/components/vermietung/angebot/AngebotCard.tsx";
import InfoCard from "@/components/vermietung/angebot/InfoCard.tsx";
import ZusaetzlicheInfosCard from "@/components/vermietung/angebot/ZusaetzlicheInfosCard.tsx";
import { JazzRow } from "@/widgets/JazzRow";

export default function TabAngebot() {
  return (
    <JazzRow>
      <Col xs={24} lg={12}>
        <AngebotCard />
      </Col>
      <Col xs={24} lg={12}>
        <ZusaetzlicheInfosCard />
        <InfoCard />
      </Col>
    </JazzRow>
  );
}
