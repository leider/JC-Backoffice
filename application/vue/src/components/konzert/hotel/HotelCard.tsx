import React, { useEffect, useState } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import dayjs from "dayjs";
import cloneDeep from "lodash/cloneDeep";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import { useWatch } from "antd/es/form/Form";
import StartEndDateOnlyPickers from "@/widgets/StartEndDateOnlyPickers.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import find from "lodash/find";
import { JazzRow } from "@/widgets/JazzRow";

export default function HotelCard() {
  const form = useFormInstance();
  const { optionen } = useJazzContext();

  const [summe, setSumme] = useState<number>(0);
  const [anzahlNacht, setAnzahlNacht] = useState<string>("");

  const hotelName = useWatch(["hotel", "name"]);

  const eventStartDate = useWatch(["startDate"], {
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
      if (find(optionen?.hotels, { name: hotelName })) {
        const preise = find(optionen.hotelpreise, ["name", hotelName]);
        if (preise) {
          const { einzelEUR, suiteEUR, doppelEUR } = preise;
          form.setFieldsValue({ unterkunft: { einzelEUR, suiteEUR, doppelEUR } });
        }
      }
    }, // eslint-disable-next-line react-hooks/exhaustive-deps
    [hotelName],
  );

  useEffect(updateSumme, [form]);

  function updateSumme() {
    const konzert = new Konzert(cloneDeep(form.getFieldsValue(true)));
    setSumme(konzert.unterkunft.roomsTotalEUR);
    setAnzahlNacht(konzert.unterkunft.anzNacht);
  }

  return (
    <Collapsible suffix="hotel" label="Zimmer" amount={summe}>
      <JazzRow>
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
      </JazzRow>
      <JazzRow>
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
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <CheckItem name={["hotelpreiseAlsDefault"]} label="Preise als Default übernehmen" />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
