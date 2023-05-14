import { Col, FormInstance, Row } from "antd";
import React from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import HotelCard from "@/components/veranstaltung/hotel/HotelCard";
import KontaktCard from "@/components/veranstaltung/allgemeines/KontaktCard";
import TransportCard from "@/components/veranstaltung/hotel/TransportCard";

interface TabHotelProps {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
}

export default function TabHotel({ optionen, veranstaltung, form }: TabHotelProps) {
  return (
    <Row gutter={12}>
      <Col span={12}>
        <KontaktCard kontakte={optionen.hotels} form={form} selector="hotel" />
        <HotelCard form={form} optionen={optionen} veranstaltung={veranstaltung} />
      </Col>
      <Col span={12}>
        <TransportCard form={form} optionen={optionen} veranstaltung={veranstaltung} />
      </Col>
    </Row>
  );
}
