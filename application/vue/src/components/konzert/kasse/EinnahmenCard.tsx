import React, { forwardRef, Ref, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { TextField } from "@/widgets/TextField";
import Kasse from "jc-shared/konzert/kasse";
import { KasseCardProps } from "@/components/konzert/kasse/TabKasse";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";

const EinnahmenCard = forwardRef(function ({ disabled }: KasseCardProps, ref: Ref<HTMLDivElement> | undefined) {
  const form = useFormInstance();
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
      <JazzRow ref={ref}>
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
      </JazzRow>
      <JazzRow>
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
      </JazzRow>
      <JazzRow>
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
      </JazzRow>
      <JazzRow>
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
      </JazzRow>
    </Collapsible>
  );
});

export default EinnahmenCard;
