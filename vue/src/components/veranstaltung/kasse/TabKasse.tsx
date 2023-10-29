import { Col, Form, FormInstance, Row } from "antd";
import React, { useEffect } from "react";
import EinnahmenCard from "@/components/veranstaltung/kasse/EinnahmenCard";
import AusgabenCard from "@/components/veranstaltung/kasse/AusgabenCard";
import { KassenzettelFreigabe } from "@/components/veranstaltung/kasse/KassenzettelFreigabe";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { DynamicItem } from "@/widgets/DynamicItem";
import Kasse from "jc-shared/veranstaltung/kasse";
import { VeranstaltungTabProps } from "@/components/veranstaltung/VeranstaltungTabs";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

export interface KasseCardProps {
  form: FormInstance<Veranstaltung>;
  disabled: boolean;
}

export default function TabKasse({ form }: VeranstaltungTabProps) {
  function anfangsbestandChanged() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    form.setFieldValue("endbestandEUR", kasse.endbestandEUR);
  }

  useEffect(() => anfangsbestandChanged, [form]);

  const freigabe = Form.useWatch(["kasse", "kassenfreigabe"]);

  return (
    <>
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <EinnahmenCard form={form} disabled={freigabe} />
          <KassenzettelFreigabe form={form} />
        </Col>
        <Col xs={24} lg={12}>
          <AusgabenCard form={form} disabled={freigabe} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col xs={12} lg={6}>
          <NumberInput
            name={["kasse", "anfangsbestandEUR"]}
            label="Anfangsbestand Kasse"
            decimals={2}
            suffix={"€"}
            onChange={anfangsbestandChanged}
            disabled={freigabe}
          />
        </Col>
        <Col xs={12} lg={6}>
          <DynamicItem
            nameOfDepending="endbestandEUR"
            renderWidget={() => <NumberInput disabled name={"endbestandEUR"} label="Endbestand Kasse" decimals={2} suffix={"€"} />}
          />
        </Col>
      </Row>
    </>
  );
}
