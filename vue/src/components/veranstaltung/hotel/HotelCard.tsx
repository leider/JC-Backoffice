import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, Row } from "antd";
import StartEndDateOnlyPickers from "@/widgets-react/StartEndDateOnlyPickers";
import TextArea from "antd/es/input/TextArea";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import { fromFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import CheckItem from "@/widgets-react/CheckItem";
import { TabProps } from "@/components/veranstaltung/VeranstaltungTabs";

export default function HotelCard({ form, optionen, veranstaltung }: TabProps) {
  const [summe, setSumme] = useState<number>(0);
  const [anzahlNacht, setAnzahlNacht] = useState<string>("");

  const hotelName = Form.useWatch(["hotel", "name"]);

  useEffect(() => {
    if (optionen.hotels.find((h) => h.name === hotelName)) {
      const preise = optionen.hotelpreise.find((pr) => pr.name === hotelName);
      if (preise) {
        form.setFieldsValue({ unterkunft: { ...preise } });
      }
    }
  }, [hotelName]);

  useEffect(() => {
    updateSumme();
  }, [veranstaltung, form]);
  function updateSumme() {
    const veranstaltung = fromFormObject(form);
    setSumme(veranstaltung.unterkunft.roomsTotalEUR);
    setAnzahlNacht(veranstaltung.unterkunft.anzNacht);
  }

  return (
    <CollapsibleForVeranstaltung suffix="hotel" label="Zimmer" amount={summe}>
      <Row gutter={12}>
        <Col span={12}>
          <StartEndDateOnlyPickers
            name={["unterkunft", "anAbreise"]}
            label="An- und Abreise"
            dependency={"startAndEnd"}
            onChange={updateSumme}
          />
          {anzahlNacht}
        </Col>
        <Col span={12}>
          <Form.Item label={<b>Kommentar:</b>} name={["unterkunft", "kommentar"]}>
            <TextArea rows={7} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={3}>
          <NumberInput name={["unterkunft", "einzelNum"]} label="Einzel" decimals={0} onChange={updateSumme} />
        </Col>
        <Col span={5}>
          <NumberInput name={["unterkunft", "einzelEUR"]} label="Preis" decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
        <Col span={3}>
          <NumberInput name={["unterkunft", "doppelNum"]} label="Doppel" decimals={0} onChange={updateSumme} />
        </Col>
        <Col span={5}>
          <NumberInput name={["unterkunft", "doppelEUR"]} label="Preis" decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
        <Col span={3}>
          <NumberInput name={["unterkunft", "suiteNum"]} label="Suite" decimals={0} onChange={updateSumme} />
        </Col>
        <Col span={5}>
          <NumberInput name={["unterkunft", "suiteEUR"]} label="Preis" decimals={2} suffix={"€"} onChange={updateSumme} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <CheckItem name={["hotelpreiseAlsDefault"]} label="Preise als Default übernehmen" />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
