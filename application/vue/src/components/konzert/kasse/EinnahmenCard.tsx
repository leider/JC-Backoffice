import React, { useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { TextField } from "@/widgets/TextField";
import Kasse from "jc-shared/konzert/kasse";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { KassenContext } from "@/components/konzert/kasse/KassenContext.ts";
import { useWatch } from "antd/es/form/Form";

export default function EinnahmenCard() {
  const form = useFormInstance();
  const { refEinnahmen } = useContext(KassenContext);
  const { color } = colorsAndIconsForSections;
  const freigabe = useWatch(["kasse", "kassenfreigabe"]);

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
      <JazzRow ref={refEinnahmen}>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeTicketsEUR"]}
            label="Tickets (AK)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
        <Col span={8}>
          <Form.Item label="&nbsp;">
            <ButtonWithIcon block text="Berechnen..." color={color("kasse")} onClick={calculateTickets} alwaysText disabled={freigabe} />
          </Form.Item>
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput name={["kasse", "anzahlBesucherAK"]} label="Besucher gesamt" decimals={0} disabled={freigabe} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeBankEUR"]}
            label="Bareinlage"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField name={["kasse", "einnahmeSonstiges1Text"]} label="Sonstiges" disabled={freigabe} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeSonstiges1EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField name={["kasse", "einnahmeSonstiges2Text"]} label="Sonstiges" disabled={freigabe} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kasse", "einnahmeSonstiges2EUR"]}
            label="Betrag"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled={freigabe}
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
