import { Col } from "antd";
import React from "react";
import HotelCard from "@/components/konzert/hotel/HotelCard";
import KontaktCard from "@/components/konzert/allgemeines/KontaktCard";
import TransportCard from "@/components/konzert/hotel/TransportCard";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import ScrollingContent from "@/components/content/ScrollingContent.tsx";

export default function TabHotel() {
  const { optionen } = useJazzContext();
  return (
    <ScrollingContent>
      <JazzRow>
        <Col lg={12} xs={24}>
          <KontaktCard kontakte={optionen!.hotels} noTopBorder selector="hotel" />
          <HotelCard />
        </Col>
        <Col lg={12} xs={24}>
          <TransportCard />
        </Col>
      </JazzRow>
    </ScrollingContent>
  );
}
