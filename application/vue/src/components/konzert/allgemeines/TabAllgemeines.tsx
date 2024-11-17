import { Col, Row } from "antd";
import React, { useContext } from "react";
import EventCard from "@/components/konzert/allgemeines/EventCard";
import ArtistCard from "@/components/konzert/allgemeines/ArtistCard";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard.tsx";
import KontaktCard from "@/components/konzert/allgemeines/KontaktCard";
import VertragCard from "@/components/konzert/allgemeines/VertragCard";
import BearbeiterCard from "@/components/konzert/allgemeines/BearbeiterCard";
import MitarbeiterCard from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";

export default function TabAllgemeines() {
  const { form } = useContext(KonzertContext)!;
  const { optionen } = useJazzContext();

  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EventCard />
        <ArtistCard />
        <KommentarCard />
      </Col>
      <Col xs={24} lg={12}>
        <MitarbeiterCard form={form} />
        <KontaktCard kontakte={optionen!.agenturen} selector="agentur">
          <Row gutter={12}>
            <Col span={12}>
              <NumberInput name={["kosten", "provisionAgentur"]} label="Provision" decimals={2} suffix="€" />
            </Col>
          </Row>
        </KontaktCard>
        <VertragCard />
        <BearbeiterCard />
      </Col>
    </Row>
  );
}
