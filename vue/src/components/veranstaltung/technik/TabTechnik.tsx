import { Col, FormInstance, Row } from "antd";
import React from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import TechnikCard from "@/components/veranstaltung/technik/TechnikCard";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

interface TabTechnikProps {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
}

export default function TabTechnik({ optionen, veranstaltung, form }: TabTechnikProps) {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <TechnikCard form={form} optionen={optionen} veranstaltung={veranstaltung} />
      </Col>
    </Row>
  );
}
