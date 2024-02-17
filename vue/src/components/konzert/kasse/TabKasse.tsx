import { Col, Form, Row } from "antd";
import React, { useContext, useEffect } from "react";
import EinnahmenCard from "@/components/konzert/kasse/EinnahmenCard";
import AusgabenCard from "@/components/konzert/kasse/AusgabenCard";
import { KassenzettelFreigabe } from "@/components/konzert/kasse/KassenzettelFreigabe";
import { NumberInput } from "@/widgets/numericInputWidgets";
import Kasse from "jc-shared/konzert/kasse";
import { KonzertContext } from "@/components/konzert/KonzertComp.tsx";

export interface KasseCardProps {
  disabled: boolean;
}

export default function TabKasse() {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;

  const anfangsbestandEUR = Form.useWatch(["kasse", "anfangsbestandEUR"], { form, preserve: true });

  function anfangsbestandChanged() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    form.setFieldValue("endbestandEUR", kasse.endbestandEUR);
  }

  useEffect(anfangsbestandChanged, [form, anfangsbestandEUR]);

  const freigabe = Form.useWatch(["kasse", "kassenfreigabe"]);

  return (
    <>
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <EinnahmenCard disabled={freigabe} />
          <KassenzettelFreigabe />
        </Col>
        <Col xs={24} lg={12}>
          <AusgabenCard disabled={freigabe} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={8} lg={4}>
          <NumberInput name={["kasse", "anfangsbestandEUR"]} label="Anfangsbestand Kasse" decimals={2} suffix={"€"} disabled />
        </Col>
        <Col xs={8} lg={4}>
          <NumberInput disabled name={["kasse", "endbestandGezaehltEUR"]} label="Endbestand Gezählt" decimals={2} suffix={"€"} />
        </Col>
        <Col xs={8} lg={4}>
          <NumberInput disabled name={"endbestandEUR"} label="Endbestand Berechnet" decimals={2} suffix={"€"} />
        </Col>
      </Row>
    </>
  );
}
