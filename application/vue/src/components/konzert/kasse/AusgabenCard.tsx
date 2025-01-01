import React, { forwardRef, Ref, useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form, Row } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { TextField } from "@/widgets/TextField";
import Kasse from "jc-shared/konzert/kasse";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { KasseCardProps } from "@/components/konzert/kasse/TabKasse";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { KassenContext } from "@/components/konzert/kasse/KassenContext.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";

const AusgabenCard = forwardRef(function AusgabenCard({ disabled }: KasseCardProps, ref: Ref<HTMLDivElement> | undefined) {
  const form = useFormInstance();
  const kassenContext = useContext(KassenContext);
  const { color } = colorsAndIconsForSections;

  const [readonly, setReadonly] = useState<boolean>(false);
  useEffect(() => {
    setReadonly(disabled);
  }, [disabled]);

  const [summe, setSumme] = useState<number>(0);
  useEffect(updateSumme);

  function updateSumme() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    setSumme(kasse.ausgabenTotalEUR);
    form.setFieldValue("endbestandEUR", kasse.endbestandEUR);
  }
  const { lg } = useBreakpoint();

  function calculateAnBank() {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    const anBank = kasse.einnahmeTotalEUR - kasse.ausgabenOhneGage;
    form.setFieldValue(["kasse", "ausgabeBankEUR"], anBank);
    updateSumme();
  }

  return (
    <Collapsible suffix="kasse" label="Ausgaben (Bar und mit Beleg)" noTopBorder={lg} amount={summe}>
      <Row ref={ref} gutter={12}>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeCateringEUR"]}
            label="Catering"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeHelferEUR"]}
            label="Personal"
            decimals={2}
            suffix={"€"}
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["kasse", "ausgabeSonstiges1Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges1EUR"]}
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
          <TextField name={["kasse", "ausgabeSonstiges2Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges2EUR"]}
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
          <TextField name={["kasse", "ausgabeSonstiges3Text"]} label="Sonstiges" disabled={readonly} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeSonstiges3EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={readonly}
          />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8} offset={8}>
          <Form.Item label="&nbsp;">
            <ButtonWithIcon
              ref={kassenContext.refAnBank}
              block
              text="Berechnen..."
              color={color("kasse")}
              onClick={calculateAnBank}
              alwaysText
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <NumberInput
            name={["kasse", "ausgabeBankEUR"]}
            label="An Bank"
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

export default AusgabenCard;
