import React, { useCallback, useContext } from "react";
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
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";
import useKassenSaldierer from "@/components/konzert/kasse/useKassenSaldierer.ts";
import { JazzRowWithRef } from "@/widgets/JazzRowWithRef.tsx";

export default function EinnahmenCard() {
  const form = useFormInstance<KonzertWithRiderBoxes & { endbestandEUR: number }>();
  const { refEinnahmen } = useContext(KassenContext);
  const { color } = colorsAndIconsForSections;
  const freigabe = useWatch(["kasse", "kassenfreigabe"], { form, preserve: true });

  const { einnahmeTotalEUR } = useKassenSaldierer();

  const calculateTickets = useCallback(() => {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    const tickets =
      kasse.endbestandGezaehltEUR -
      kasse.anfangsbestandEUR -
      kasse.ausgabenTotalEUR -
      kasse.einnahmeBankEUR -
      kasse.einnahmeOhneBankUndTickets +
      kasse.ausgabeBankEUR;

    form.setFieldValue(["kasse", "einnahmeTicketsEUR"], tickets);
  }, [form]);

  return (
    <Collapsible amount={einnahmeTotalEUR} label="Einnahmen Abendkasse" noTopBorder suffix="kasse">
      <JazzRowWithRef ref={refEinnahmen}>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Tickets (AK)" name={["kasse", "einnahmeTicketsEUR"]} suffix="€" />
        </Col>
        <Col span={8}>
          <Form.Item label="&nbsp;">
            <ButtonWithIcon alwaysText block color={color("kasse")} disabled={!!freigabe} onClick={calculateTickets} text="Berechnen..." />
          </Form.Item>
        </Col>
      </JazzRowWithRef>
      <JazzRow>
        <Col span={8}>
          <NumberInput decimals={0} disabled={!!freigabe} label="Besucher gesamt" name={["kasse", "anzahlBesucherAK"]} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Bareinlage" name={["kasse", "einnahmeBankEUR"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={!!freigabe} label="Sonstiges" name={["kasse", "einnahmeSonstiges1Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Betrag" name={["kasse", "einnahmeSonstiges1EUR"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={!!freigabe} label="Sonstiges" name={["kasse", "einnahmeSonstiges2Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Betrag" name={["kasse", "einnahmeSonstiges2EUR"]} suffix="€" />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
