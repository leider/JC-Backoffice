import { Col, Row } from "antd";
import React from "react";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard.tsx";
import MitarbeiterCard from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import EventCard from "@/components/vermietung/allgemeines/EventCard.tsx";
import ArtistCard from "@/components/vermietung/allgemeines/ArtistCard.tsx";
import VertragspartnerCard from "@/components/vermietung/allgemeines/VertragspartnerCard.tsx";

export default function TabAllgemeines() {
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EventCard />
        <ArtistCard />
        <KommentarCard forVermietung />
      </Col>
      <Col xs={24} lg={12}>
        <MitarbeiterCard forVermietung />
        <VertragspartnerCard />
      </Col>
    </Row>
  );
}
