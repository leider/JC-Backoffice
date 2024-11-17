import { Col, Row } from "antd";
import React, { useContext } from "react";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard.tsx";
import MitarbeiterCard from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import EventCard from "@/components/vermietung/allgemeines/EventCard.tsx";
import ArtistCard from "@/components/vermietung/allgemeines/ArtistCard.tsx";
import VertragspartnerCard from "@/components/vermietung/allgemeines/VertragspartnerCard.tsx";
import { VermietungContext } from "@/components/vermietung/VermietungContext.ts";

export default function TabAllgemeines() {
  const { form } = useContext(VermietungContext)!;
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EventCard />
        <ArtistCard />
        <KommentarCard forVermietung />
      </Col>
      <Col xs={24} lg={12}>
        <MitarbeiterCard form={form} forVermietung />
        <VertragspartnerCard />
      </Col>
    </Row>
  );
}
