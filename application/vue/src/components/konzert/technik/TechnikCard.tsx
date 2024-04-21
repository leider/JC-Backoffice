import React, { useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Row } from "antd";
import { TextField } from "@/widgets/TextField";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import Konzert from "jc-shared/konzert/konzert.ts";
import Uploader from "@/widgets/Uploader.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { KonzertContext } from "@/components/konzert/KonzertComp.tsx";

export default function TechnikCard() {
  const konzertContext = useContext(KonzertContext);
  const { optionen } = useJazzContext();
  const form = konzertContext!.form;
  const { backlineJazzclub, backlineRockshop } = optionen;

  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    const konzert = new Konzert(form.getFieldsValue(true));
    setSumme(konzert.kosten.backlineUndTechnikEUR);
  }, [form]);

  function updateSumme() {
    const konzert = new Konzert(form.getFieldsValue(true));
    setSumme(konzert.kosten.backlineUndTechnikEUR);
  }

  function updateFluegelKosten(e: CheckboxChangeEvent) {
    if (!e.target.checked) {
      form.setFieldValue(["kosten", "fluegelstimmerEUR"], 0);
    }
    updateSumme();
  }

  return (
    <Collapsible suffix="technik" label="Backline" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={8}>
          <CheckItem name={["technik", "checked"]} label="Technik ist geklärt" />
        </Col>
        <Col span={8}>
          <CheckItem name={["technik", "fluegel"]} label="Flügel stimmen" onChange={updateFluegelKosten} />
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
      </Row>
      <Row gutter={12} align="bottom" style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Uploader form={form} name={["technik", "dateirider"]} typ={"rider"} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <MultiSelectWithTags name={["technik", "backlineJazzclub"]} label="Backline Jazzclub" options={backlineJazzclub} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <MultiSelectWithTags name={["technik", "backlineRockshop"]} label="Backline Rockshop" options={backlineRockshop} />
        </Col>
        <Col span={8}>
          <NumberInput name={["kosten", "backlineEUR"]} label="Betrag" decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={16}>
          <TextField name={["technik", "technikAngebot1"]} label="Technik Zumietung" />
        </Col>
        <Col span={8}>
          <NumberInput name={["kosten", "technikAngebot1EUR"]} label="Betrag" decimals={2} suffix="€" onChange={updateSumme} />
        </Col>
      </Row>
    </Collapsible>
  );
}
