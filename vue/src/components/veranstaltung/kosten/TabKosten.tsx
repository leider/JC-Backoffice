import { Col, FormInstance, Row } from "antd";
import React, { useState } from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import EinnahmenCard from "@/components/veranstaltung/kosten/EinnahmenCard";
import AusgabenCard from "@/components/veranstaltung/kosten/AusgabenCard";
import EinAusCard from "@/components/veranstaltung/kosten/EinAusCard";

interface TabKostenProps {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
}

export default function TabKosten({ veranstaltung, optionen, form }: TabKostenProps) {
  const [einnahmen, setEinnahmen] = useState<number>(0);
  const [ausgaben, setAusgaben] = useState<number>(0);
  function einnahmenChanged() {
    setEinnahmen(einnahmen + 1);
  }

  function ausgabenChanged() {
    setAusgaben(ausgaben + 1);
  }

  return (
    <Row gutter={12}>
      <Col span={12}>
        <EinnahmenCard veranstaltung={veranstaltung} optionen={optionen} form={form} onChange={einnahmenChanged} />
        <EinAusCard form={form} ausgaben={ausgaben} einnahmen={einnahmen} />
      </Col>
      <Col span={12}>
        <AusgabenCard veranstaltung={veranstaltung} optionen={optionen} form={form} onChange={ausgabenChanged} />
      </Col>
    </Row>
  );
}
