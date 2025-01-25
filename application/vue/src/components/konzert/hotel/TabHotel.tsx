import { Col } from "antd";
import React from "react";
import HotelCard from "@/components/konzert/hotel/HotelCard";
import KontaktCard from "@/components/konzert/allgemeines/KontaktCard";
import TransportCard from "@/components/konzert/hotel/TransportCard";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function TabHotel() {
  const { optionen } = useJazzContext();
  return (
    <JazzRow>
      <Col xs={24} lg={12}>
        <KontaktCard kontakte={optionen!.hotels} selector="hotel" noTopBorder />
        <HotelCard />
      </Col>
      <Col xs={24} lg={12}>
        <TransportCard />
      </Col>
    </JazzRow>
  );
}
