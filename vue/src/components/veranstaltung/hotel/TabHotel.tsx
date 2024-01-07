import { Col, Row } from "antd";
import React from "react";
import HotelCard from "@/components/veranstaltung/hotel/HotelCard";
import KontaktCard from "@/components/veranstaltung/allgemeines/KontaktCard";
import TransportCard from "@/components/veranstaltung/hotel/TransportCard";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function TabHotel() {
  const { optionen } = useJazzContext();
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <KontaktCard kontakte={optionen!.hotels} selector="hotel" noTopBorder />
        <HotelCard />
      </Col>
      <Col xs={24} lg={12}>
        <TransportCard />
      </Col>
    </Row>
  );
}
