import React, { forwardRef, Ref, useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { TextField } from "@/widgets/TextField";
import Kasse from "jc-shared/konzert/kasse";
import { KasseCardProps } from "@/components/konzert/kasse/TabKasse";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";

const EinnahmenCard = forwardRef(function ({ disabled }: KasseCardProps, ref: Ref<HTMLDivElement> | undefined) {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;
  const { color } = colorsAndIconsForSections;

  const [readonly, setReadonly] = useState<boolean>(false);
  useEffect(() => {
    setReadonly(disabled);
  }, [disabled]);

  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    updateSumme();
  });

  function updateSumme() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    setSumme(kasse.einnahmeTotalEUR);
    form.setFieldValue("endbestandEUR", kasse.endbestandEUR);
  }

  function calculateTickets() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    const tickets =
      kasse.endbestandGezaehltEUR -
      kasse.anfangsbestandEUR -
      kasse.ausgabenTotalEUR -
      kasse.einnahmeBankEUR -
      kasse.einnahmeOhneBankUndTickets +
      kasse.ausgabeBankEUR;

    form.setFieldValue(["kasse", "einnahmeTicketsEUR"], tickets);
    updateSumme();
  }

  return (
    <Collapsible suffix="kasse" label="Einnahmen Abendkasse" noTopBorder amount={summe}>
      <Row ref={ref} gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeTicketsEUR"]}
            label="Tickets (AK)"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <Form.Item label="&nbsp;">
            <ButtonWithIcon block text="Berechnen..." color={color("kasse")} onClick={calculateTickets} alwaysText />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <NumberInput name={["kasse", "anzahlBesucherAK"]} label="Besucher gesamt" decimals={0} disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeBankEUR"]}
            label="Bareinlage"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "einnahmeSonstiges1Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeSonstiges1EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "einnahmeSonstiges2Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeSonstiges2EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
    </Collapsible>
  );
});

export default EinnahmenCard;
