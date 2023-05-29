import { Col, Row } from "antd";
import React from "react";
import HotelCard from "@/components/veranstaltung/hotel/HotelCard";
import KontaktCard from "@/components/veranstaltung/allgemeines/KontaktCard";
import TransportCard from "@/components/veranstaltung/hotel/TransportCard";
import { TabProps } from "@/components/veranstaltung/VeranstaltungTabs";

export default function TabHotel({ veranstaltung, optionen, form }: TabProps) {
  return (
    <Row gutter={12}>
      <Col xs={24} lg={12}>
        <KontaktCard kontakte={optionen!.hotels} form={form} selector="hotel" />
        <HotelCard form={form} optionen={optionen} veranstaltung={veranstaltung} />
      </Col>
      <Col xs={24} lg={12}>
        <TransportCard form={form} veranstaltung={veranstaltung!} />
      </Col>
    </Row>
  );
}
