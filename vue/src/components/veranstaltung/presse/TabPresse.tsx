import { Col, FormInstance, Row } from "antd";
import React from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import HotelCard from "@/components/veranstaltung/hotel/HotelCard";
import KontaktCard from "@/components/veranstaltung/allgemeines/KontaktCard";
import TransportCard from "@/components/veranstaltung/hotel/TransportCard";
import PresseCard from "@/components/veranstaltung/presse/PresseCard";

interface TabPresseProps {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
}

export default function TabPresse({ optionen, veranstaltung, form }: TabPresseProps) {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <PresseCard form={form} optionen={optionen} veranstaltung={veranstaltung} />
      </Col>
    </Row>
  );
}
