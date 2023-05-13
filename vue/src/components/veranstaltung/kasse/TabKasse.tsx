import { Col, FormInstance, Row } from "antd";
import React from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import EinnahmenCard from "@/components/veranstaltung/kasse/EinnahmenCard";
import AusgabenCard from "@/components/veranstaltung/kasse/AusgabenCard";

interface TabKasseProps {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
}

export default function TabKasse({ optionen, veranstaltung, form }: TabKasseProps) {
  return (
    <Row gutter={12}>
      <Col span={12}>
        <EinnahmenCard form={form} veranstaltung={veranstaltung} />
      </Col>
      <Col span={12}>
        <AusgabenCard form={form} veranstaltung={veranstaltung} />
      </Col>
    </Row>
  );
}
