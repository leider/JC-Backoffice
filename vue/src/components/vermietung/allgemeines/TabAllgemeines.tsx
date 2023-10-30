import { Col, Row } from "antd";
import React from "react";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard";
import MitarbeiterCard from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import EventCard from "@/components/vermietung/allgemeines/EventCard.tsx";
import ArtistCard from "@/components/vermietung/allgemeines/ArtistCard.tsx";

export default function TabAllgemeines() {
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EventCard />
        <ArtistCard />
        <KommentarCard />
      </Col>
      <Col xs={24} lg={12}>
        <MitarbeiterCard forVermietung />
      </Col>
    </Row>
  );
}
