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
    <Collapsible amount={summe} label="Zimmer" suffix="hotel">
      <JazzRow>
        <Col span={12}>
          <StartEndDateOnlyPickers
            dependency="startDate"
            label="An- und Abreise"
            names={[
              ["unterkunft", "anreiseDate"],
              ["unterkunft", "abreiseDate"],
            ]}
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
          <NumberInput decimals={0} label="Einzel" name={["unterkunft", "einzelNum"]} onChange={updateSumme} />
        </Col>
        <Col span={5}>
          <NumberInput decimals={2} label="Preis" name={["unterkunft", "einzelEUR"]} onChange={updateSumme} suffix="€" />
        </Col>
        <Col span={3}>
          <NumberInput decimals={0} label="Doppel" name={["unterkunft", "doppelNum"]} onChange={updateSumme} />
        </Col>
        <Col span={5}>
          <NumberInput decimals={2} label="Preis" name={["unterkunft", "doppelEUR"]} onChange={updateSumme} suffix="€" />
        </Col>
        <Col span={3}>
          <NumberInput decimals={0} label="Suite" name={["unterkunft", "suiteNum"]} onChange={updateSumme} />
        </Col>
        <Col span={5}>
          <NumberInput decimals={2} label="Preis" name={["unterkunft", "suiteEUR"]} onChange={updateSumme} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <CheckItem label="Preise als Default übernehmen" name={["hotelpreiseAlsDefault"]} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
