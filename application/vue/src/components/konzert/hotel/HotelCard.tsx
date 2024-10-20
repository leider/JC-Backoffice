import React, { useContext, useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form, Row } from "antd";
import StartEndDateOnlyPickers from "@/components/konzert/hotel/StartEndDateOnlyPickers.tsx";
import TextArea from "antd/es/input/TextArea";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import dayjs from "dayjs";
import { KonzertContext } from "@/components/konzert/KonzertComp";
import cloneDeep from "lodash/cloneDeep";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Konzert from "jc-shared/konzert/konzert.ts";

export default function HotelCard() {
  const konzertContext = useContext(KonzertContext);
  const { optionen } = useJazzContext();

  const form = konzertContext!.form;

  const [summe, setSumme] = useState<number>(0);
  const [anzahlNacht, setAnzahlNacht] = useState<string>("");

  const hotelName = Form.useWatch(["hotel", "name"]);

  const eventStartDate = Form.useWatch(["startDate"], {
    form,
    preserve: true,
  });

  useEffect(
    () => {
      const start = dayjs(eventStartDate);
      if (start) {
        const hotelDatum: Date = form.getFieldValue(["unterkunft", "anreiseDate"]);
        if (!dayjs(hotelDatum).isAfter(start.subtract(7, "day"))) {
          const end = start.add(1, "day");
          form.setFieldValue(["unterkunft", "anreiseDate"], start);
          form.setFieldValue(["unterkunft", "abreiseDate"], end);
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventStartDate],
  );

  useEffect(
    () => {
      if (optionen?.hotels.find((h) => h.name === hotelName)) {
        const preise = optionen.hotelpreise.find((pr) => pr.name === hotelName);
        if (preise) {
          const { einzelEUR, suiteEUR, doppelEUR } = preise;
          form.setFieldsValue({ unterkunft: { einzelEUR, suiteEUR, doppelEUR } });
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [hotelName],
  );

  useEffect(
    () => {
      updateSumme();
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [form],
  );

  function updateSumme() {
    const konzert = new Konzert(cloneDeep(form.getFieldsValue(true)));
    setSumme(konzert.unterkunft.roomsTotalEUR);
    setAnzahlNacht(konzert.unterkunft.anzNacht);
  }

  return (
    <Collapsible suffix="hotel" label="Zimmer" amount={summe}>
      <Row gutter={12}>
        <Col span={12}>
          <StartEndDateOnlyPickers
            names={[
              ["unterkunft", "anreiseDate"],
              ["unterkunft", "abreiseDate"],
            ]}
            label="An- und Abreise"
            dependency={"startDate"}
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
    </Collapsible>
  );
}
