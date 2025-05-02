import React, { useCallback, useContext } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form } from "antd";
import { NumberInput } from "@/widgets/numericInputWidgets";
import { TextField } from "@/widgets/TextField";
import Kasse from "jc-shared/konzert/kasse";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";
import { KassenContext } from "@/components/konzert/kasse/KassenContext.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useWatch } from "antd/es/form/Form";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";
import useKassenSaldierer from "@/components/konzert/kasse/useKassenSaldierer.ts";
import { JazzRowWithRef } from "@/widgets/JazzRowWithRef.tsx";

export default function AusgabenCard() {
  const form = useFormInstance<KonzertWithRiderBoxes>();
  const { refAnBank, refAusgaben } = useContext(KassenContext);
  const { color } = colorsAndIconsForSections;

  const freigabe = useWatch(["kasse", "kassenfreigabe"], { form, preserve: true });
  const { ausgabenTotalEUR } = useKassenSaldierer();

  const { lg } = useBreakpoint();

  const calculateAnBank = useCallback(() => {
    const kasse: Kasse = new Kasse(form.getFieldValue("kasse"));
    const anBank = kasse.einnahmeTotalEUR - kasse.ausgabenOhneGage;
    form.setFieldValue(["kasse", "ausgabeBankEUR"], anBank);
  }, [form]);

  return (
    <Collapsible amount={ausgabenTotalEUR} label="Ausgaben (Bar und mit Beleg)" noTopBorder={lg} suffix="kasse">
      <JazzRowWithRef ref={refAusgaben}>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Catering" name={["kasse", "ausgabeCateringEUR"]} suffix="€" />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Personal" name={["kasse", "ausgabeHelferEUR"]} suffix="€" />
        </Col>
      </JazzRowWithRef>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={!!freigabe} label="Sonstiges" name={["kasse", "ausgabeSonstiges1Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Betrag" name={["kasse", "ausgabeSonstiges1EUR"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={!!freigabe} label="Sonstiges" name={["kasse", "ausgabeSonstiges2Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Betrag" name={["kasse", "ausgabeSonstiges2EUR"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField disabled={!!freigabe} label="Sonstiges" name={["kasse", "ausgabeSonstiges3Text"]} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="Betrag" name={["kasse", "ausgabeSonstiges3EUR"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col offset={8} span={8}>
          <Form.Item label="&nbsp;">
            <ButtonWithIcon
              alwaysText
              block
              color={color("kasse")}
              disabled={!!freigabe}
              onClick={calculateAnBank}
              ref={refAnBank}
              text="Berechnen..."
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <NumberInput decimals={2} disabled={!!freigabe} label="An Bank" name={["kasse", "ausgabeBankEUR"]} suffix="€" />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
