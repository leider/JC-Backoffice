import { Col, Row } from "antd";
import React, { useEffect, useState } from "react";
import KommentarCard from "@/components/veranstaltung/allgemeines/KommentarCard";
import MitarbeiterCard from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import { VermietungTabProps } from "@/components/vermietung/VermietungTabs.tsx";
import EventCard from "@/components/vermietung/allgemeines/EventCard.tsx";
import ArtistCard from "@/components/vermietung/allgemeines/ArtistCard.tsx";

export default function TabAllgemeines({ optionen }: VermietungTabProps) {
  const [artists, setArtists] = useState<string[]>([]);

  useEffect(() => {
    setArtists(optionen?.artists || []);
  }, [optionen]);

  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <EventCard />
        <ArtistCard artists={artists} />
        <KommentarCard />
      </Col>
      <Col xs={24} lg={12}>
        <MitarbeiterCard forVermietung />
      </Col>
    </Row>
  );
}
