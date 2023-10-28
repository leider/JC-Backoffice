import { Col, Row } from "antd";
import React from "react";
import EventCard from "@/components/veranstaltung/allgemeines/EventCard";
import ArtistCard from "@/components/veranstaltung/allgemeines/ArtistCard";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard";
import KontaktCard from "@/components/veranstaltung/allgemeines/KontaktCard";
import VertragCard from "@/components/veranstaltung/allgemeines/VertragCard";
import BearbeiterCard from "@/components/veranstaltung/allgemeines/BearbeiterCard";
import { TabProps } from "@/components/veranstaltung/VeranstaltungTabs";
import MitarbeiterCard from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";

export default function TabAllgemeines({ optionen, orte, form, veranstaltung }: TabProps) {
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EventCard form={form} optionen={optionen!} orte={orte!} />
        <ArtistCard artists={optionen!.artists} />
        <KommentarCard />
      </Col>
      <Col xs={24} lg={12}>
        <MitarbeiterCard />
        <KontaktCard kontakte={optionen!.agenturen} form={form} selector="agentur">
          <Row gutter={12}>
            <Col span={12}>
              <NumberInput name={["kosten", "provisionAgentur"]} label="Provision" decimals={2} suffix="€" />
            </Col>
          </Row>
        </KontaktCard>
        <VertragCard form={form} veranstaltung={veranstaltung!} />
        <BearbeiterCard veranstaltung={veranstaltung!} />
      </Col>
    </Row>
  );
}
