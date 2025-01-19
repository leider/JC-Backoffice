import { Col } from "antd";
import React from "react";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard.tsx";
import MitarbeiterCard from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import EventCard from "@/components/vermietung/allgemeines/EventCard.tsx";
import ArtistCard from "@/components/vermietung/allgemeines/ArtistCard.tsx";
import VertragspartnerCard from "@/components/vermietung/allgemeines/VertragspartnerCard.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function TabAllgemeines() {
  return (
    <JazzRow>
      <Col xs={24} lg={12}>
        <EventCard />
        <ArtistCard />
        <KommentarCard forVermietung />
      </Col>
      <Col xs={24} lg={12}>
        <MitarbeiterCard forVermietung />
        <VertragspartnerCard />
      </Col>
    </JazzRow>
  );
}
