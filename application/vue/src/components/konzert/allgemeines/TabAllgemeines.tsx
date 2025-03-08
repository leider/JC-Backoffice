import { Col } from "antd";
import React from "react";
import EventCard from "@/components/konzert/allgemeines/EventCard";
import ArtistCard from "@/components/konzert/allgemeines/ArtistCard";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard.tsx";
import KontaktCard from "@/components/konzert/allgemeines/KontaktCard";
import VertragCard from "@/components/konzert/allgemeines/VertragCard";
import BearbeiterCard from "@/components/konzert/allgemeines/BearbeiterCard";
import MitarbeiterCard from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function TabAllgemeines() {
  const { optionen } = useJazzContext();

  return (
    <JazzRow>
      <Col lg={12} xs={24}>
        <EventCard />
        <ArtistCard />
        <KommentarCard />
      </Col>
      <Col lg={12} xs={24}>
        <MitarbeiterCard />
        <KontaktCard kontakte={optionen!.agenturen} selector="agentur">
          <JazzRow>
            <Col span={12}>
              <NumberInput decimals={2} label="Provision" name={["kosten", "provisionAgentur"]} suffix="€" />
            </Col>
          </JazzRow>
        </KontaktCard>
        <VertragCard />
        <BearbeiterCard />
      </Col>
    </JazzRow>
  );
}
