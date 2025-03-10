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

export default function TechnikCard({ fuerVermietung }: { readonly fuerVermietung: boolean }) {
  const { optionen } = useJazzContext();
  const form = useFormInstance();
  const { backlineJazzclub, backlineRockshop } = optionen;

  const [summe, setSumme] = useState<number>(0);

  const updateSumme = useCallback(() => {
    const veranstaltung = fuerVermietung ? new Vermietung(form.getFieldsValue(true)) : new Konzert(form.getFieldsValue(true));
    setSumme(veranstaltung.kosten.backlineUndTechnikEUR);
  }, [form, fuerVermietung]);

  useEffect(updateSumme, [updateSumme]);

  const brauchtFluegel = useWatch(["technik", "fluegel"], { preserve: true });
  const fluegelstimmerEUR = useWatch(["kosten", "fluegelstimmerEUR"], { preserve: true });

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
    <Collapsible amount={summe} label="Backline" noTopBorder suffix="technik">
      <JazzRow>
        <Col span={8}>
          <CheckItem label="Technik ist geklärt" name={["technik", "checked"]} />
        </Col>
        <Col span={8}>
          <CheckItem label="Flügel stimmen" name={["technik", "fluegel"]} />
        </Col>
        <Col span={8}>
          <DynamicItem
            nameOfDepending={["technik", "fluegel"]}
            renderWidget={(getFieldValue) => {
              const brauchtKlavier = getFieldValue(["technik", "fluegel"]);
              return (
                <NumberInput
                  decimals={2}
                  disabled={!brauchtKlavier}
                  label="Flügelstimmer"
                  name={["kosten", "fluegelstimmerEUR"]}
                  suffix="€"
                />
              );
            }}
          />
        </Col>
      </JazzRow>
      <Row align="bottom" gutter={12} style={{ marginBottom: 12 }}>
        <Col span={24}>
          <Uploader name={["technik", "dateirider"]} typ="rider" />
        </Col>
      </Row>
      <JazzRow>
        <Col span={16}>
          <MultiSelectWithTags label="Backline Jazzclub" name={["technik", "backlineJazzclub"]} options={backlineJazzclub} />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <MultiSelectWithTags label="Backline Rockshop" name={["technik", "backlineRockshop"]} options={backlineRockshop} />
        </Col>
        <Col span={8}>
          <NumberInput decimals={2} disabled label="Betrag (alt, jetzt in Werbung eintragen)" name={["kosten", "backlineEUR"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={16}>
          <TextField label="Technik Zumietung" name={["technik", "technikAngebot1"]} />
        </Col>
        <Col span={8}>
          <NumberInput
            decimals={2}
            disabled
            label="Betrag (alt, jetzt in Werbung eintragen)"
            name={["kosten", "technikAngebot1EUR"]}
            suffix="€"
          />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
