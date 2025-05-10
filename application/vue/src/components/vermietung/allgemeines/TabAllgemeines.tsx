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
      <Col lg={12} xs={24}>
        <EventCard />
        <ArtistCard />
        <KommentarCard />
      </Col>
      <Col lg={12} xs={24}>
        <MitarbeiterCard forVermietung />
        <VertragspartnerCard />
      </Col>
    </JazzRow>
  );
}
