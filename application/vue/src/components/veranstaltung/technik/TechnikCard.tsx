import React, { useCallback, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Row } from "antd";
import { TextField } from "@/widgets/TextField.tsx";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem.tsx";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags.tsx";
import Uploader from "@/widgets/Uploader.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import { useWatch } from "antd/es/form/Form";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import Konzert from "jc-shared/konzert/konzert.ts";

export default function TechnikCard({ fuerVermietung }: { fuerVermietung: boolean }) {
  const { optionen } = useJazzContext();
  const form = useFormInstance();
  const { backlineJazzclub, backlineRockshop } = optionen;

  const [summe, setSumme] = useState<number>(0);

  const updateSumme = useCallback(() => {
    const veranstaltung = fuerVermietung ? new Vermietung(form.getFieldsValue(true)) : new Konzert(form.getFieldsValue(true));
    setSumme(veranstaltung.kosten.backlineUndTechnikEUR);
  }, [form, fuerVermietung]);

  useEffect(updateSumme, [updateSumme]);

  const brauchtFluegel = useWatch(["technik", "fluegel"], { form, preserve: true });
  const fluegelstimmerEUR = useWatch(["kosten", "fluegelstimmerEUR"], { form, preserve: true });

  useEffect(() => {
    if (brauchtFluegel === false) {
      form.setFieldValue(["kosten", "fluegelstimmerEUR"], 0);
    } else if (brauchtFluegel === true && !fluegelstimmerEUR) {
      // preis manuell oder bereits gesetzt
      form.setFieldValue(["kosten", "fluegelstimmerEUR"], optionen.preisKlavierstimmer);
    }
    updateSumme();
  }, [brauchtFluegel, fluegelstimmerEUR, form, optionen.preisKlavierstimmer, updateSumme]);

  return (
    <Collapsible suffix="technik" label="Backline" noTopBorder amount={summe}>
      <JazzRow>
        <Col span={8}>
          <CheckItem name={["technik", "checked"]} label="Technik ist geklärt" />
        </Col>
        <Col span={8}>
          <CheckItem name={["technik", "fluegel"]} label="Flügel stimmen" />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending={["technik", "fluegel"]}
            renderWidget={(getFieldValue) => {
              const brauchtKlavier = getFieldValue(["technik", "fluegel"]);
              return (
                <NumberInput
                  name={["kosten", "fluegelstimmerEUR"]}
                  label="Flügelstimmer"
                  decimals={2}
                  suffix="€"
                  onChange={updateSumme}
                  disabled={!brauchtKlavier}
                />
              );
            }}
          />
        </Col>
      </JazzRow>
      <Row gutter={12} align="bottom" style={{ marginBottom: 12 }}>
        <Col span={24}>
          <Uploader name={["technik", "dateirider"]} typ="rider" />
        </Col>
      </Row>
      <JazzRow>
        <Col span={16}>
          <MultiSelectWithTags name={["technik", "backlineJazzclub"]} label="Backline Jazzclub" options={backlineJazzclub} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <MultiSelectWithTags name={["technik", "backlineRockshop"]} label="Backline Rockshop" options={backlineRockshop} />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kosten", "backlineEUR"]}
            label="Betrag (alt, jetzt in Werbung eintragen)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled
          />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField name={["technik", "technikAngebot1"]} label="Technik Zumietung" />
        </Col>
        <Col span={8}>
          <NumberInput
            name={["kosten", "technikAngebot1EUR"]}
            label="Betrag (alt, jetzt in Werbung eintragen)"
            decimals={2}
            suffix="€"
            onChange={updateSumme}
            disabled
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
