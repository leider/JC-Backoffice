import React, { useContext, useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Row } from "antd";
import { TextField } from "@/widgets/TextField";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import MultiSelectWithTags from "@/widgets/MultiSelectWithTags";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import Uploader from "@/components/veranstaltung/Uploader";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import { RiderComp } from "@/components/rider/RiderComp.tsx";
import { BoxParams } from "@/components/rider/types.ts";

export default function RiderCard() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;
  const { backlineJazzclub, backlineRockshop } = veranstContext!.optionen;

  const [summe, setSumme] = useState<number>(0);
  useEffect(() => {
    const veranstaltung = new Veranstaltung(form.getFieldsValue(true));
    setSumme(veranstaltung.kosten.backlineUndTechnikEUR);
  }, [form]);

  function updateSumme() {
    const veranstaltung = new Veranstaltung(form.getFieldsValue(true));
    setSumme(veranstaltung.kosten.backlineUndTechnikEUR);
  }

  function updateFluegelKosten(e: CheckboxChangeEvent) {
    if (!e.target.checked) {
      form.setFieldValue(["kosten", "fluegelstimmerEUR"], 0);
    }
    updateSumme();
  }
  const [targetBoxes, setTargetBoxes] = useState<BoxParams[]>([]);
  return (
    <CollapsibleForVeranstaltung suffix="technik" label="Rider">
      <Row gutter={12}>
        <Col span={24}>
          <RiderComp targetBoxes={targetBoxes} setTargetBoxes={setTargetBoxes} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
