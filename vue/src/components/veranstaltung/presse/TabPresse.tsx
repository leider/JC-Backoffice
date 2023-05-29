import { Col, FormInstance, Row } from "antd";
import React from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import PresseCard from "@/components/veranstaltung/presse/PresseCard";

interface TabPresseProps {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
}

export default function TabPresse({ veranstaltung, form }: TabPresseProps) {
  return (
    <Row gutter={12}>
      <Col span={24}>
        <PresseCard form={form} id={veranstaltung.id} />
      </Col>
    </Row>
  );
}
