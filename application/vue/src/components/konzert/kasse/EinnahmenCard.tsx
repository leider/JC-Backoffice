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
    <Collapsible amount={summe} label="Einnahmen Abendkasse" noTopBorder suffix="kasse">
      <JazzRow ref={refEinnahmen}>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Tickets (AK)"
            name={["kasse", "einnahmeTicketsEUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
        <Col span={8}>
          <Form.Item label="&nbsp;">
            <ButtonWithIcon alwaysText block color={color("kasse")} disabled={freigabe} onClick={calculateTickets} text="Berechnen..." />
          </Form.Item>
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={0} disabled={freigabe} label="Besucher gesamt" name={["kasse", "anzahlBesucherAK"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Bareinlage"
            name={["kasse", "einnahmeBankEUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={freigabe} label="Sonstiges" name={["kasse", "einnahmeSonstiges1Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Betrag"
            name={["kasse", "einnahmeSonstiges1EUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={freigabe} label="Sonstiges" name={["kasse", "einnahmeSonstiges2Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled={freigabe}
            label="Betrag"
            name={["kasse", "einnahmeSonstiges2EUR"]}
            onChange={updateSumme}
            suffix="€"
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
