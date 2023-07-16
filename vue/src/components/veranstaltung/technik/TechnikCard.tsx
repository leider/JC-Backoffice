import OptionValues from "jc-shared/optionen/optionValues";
import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, FormInstance, Row } from "antd";
import { TextField } from "@/widgets/TextField";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import Kosten from "jc-shared/veranstaltung/kosten";
import Uploader from "@/components/veranstaltung/Uploader";

interface TechnikCardParams {
  form: FormInstance<Veranstaltung>;
  optionen: OptionValues;
  veranstaltung: Veranstaltung;
}

export default function TechnikCard({ form, optionen: { backlineJazzclub, backlineRockshop }, veranstaltung }: TechnikCardParams) {
  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    setSumme(veranstaltung.kosten.backlineUndTechnikEUR);
  }, [veranstaltung]);

  function updateSumme() {
    const kosten: Kosten = new Kosten(form.getFieldValue("kosten"));
    setSumme(kosten.backlineUndTechnikEUR);
  }

  return (
    <CollapsibleForVeranstaltung suffix="technik" label="Rider und Backline" noTopBorder amount={summe}>
      <Row gutter={12}>
        <Col span={8}>
          <CheckItem name={["technik", "checked"]} label="Technik ist geklärt" />
        </Col>
        <Col span={8}>
          <CheckItem name={["technik", "fluegel"]} label="Flügel stimmen" />
        </Col>
      </Row>
      <Row gutter={12} align="bottom" style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Uploader form={form} id={veranstaltung.id} name={["technik", "dateirider"]} typ={"rider"} />
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
    </CollapsibleForVeranstaltung>
  );
}
