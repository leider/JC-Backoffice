import { Col, Row } from "antd";
import React from "react";
import HotelCard from "@/components/konzert/hotel/HotelCard";
import KontaktCard from "@/components/konzert/allgemeines/KontaktCard";
import TransportCard from "@/components/konzert/hotel/TransportCard";
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
