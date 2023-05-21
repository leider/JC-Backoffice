import { Col, FormInstance, Row } from "antd";
import React, { useEffect, useState } from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import EinnahmenCard from "@/components/veranstaltung/kasse/EinnahmenCard";
import AusgabenCard from "@/components/veranstaltung/kasse/AusgabenCard";
import { KassenzettelFreigabe } from "@/components/veranstaltung/kasse/KassenzettelFreigabe";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import { DynamicItem } from "@/widgets-react/DynamicItem";
import Kasse from "jc-shared/veranstaltung/kasse";

interface TabKasseProps {
  veranstaltung: Veranstaltung;
  optionen: OptionValues;
  form: FormInstance<Veranstaltung>;
}

export default function TabKasse({ optionen, veranstaltung, form }: TabKasseProps) {
  function anfangsbestandChanged() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    form.setFieldValue(["kasse", "endbestandEUR"], kasse.endbestandEUR);
  }

  const [freigegeben, setFreigegeben] = useState<boolean>(false);
  useEffect(() => {
    setFreigegeben(veranstaltung.kasse.istFreigegeben);
    form.setFieldValue(["kasse", "endbestandEUR"], veranstaltung.kasse.endbestandEUR);
  }, [veranstaltung]);

  return (
    <>
      <Row gutter={12}>
        <Col xs={24} lg={12}>
          <EinnahmenCard form={form} veranstaltung={veranstaltung} disabled={freigegeben} />
          <KassenzettelFreigabe form={form} veranstaltung={veranstaltung} setFreigegeben={setFreigegeben} />
        </Col>
        <Col xs={24} lg={12}>
          <AusgabenCard form={form} veranstaltung={veranstaltung} disabled={freigegeben} />
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
            disabled={freigegeben}
          />
        </Col>
        <Col xs={12} lg={6}>
          <DynamicItem
            nameOfDepending={["kasse", "endbestandEUR"]}
            renderWidget={() => (
              <NumberInput disabled name={["kasse", "endbestandEUR"]} label="Endbestand Kasse" decimals={2} suffix={"€"} />
            )}
          />
        </Col>
      </Row>
    </>
  );
}
