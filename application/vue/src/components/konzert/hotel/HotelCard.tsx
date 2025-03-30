import React, { useContext, useEffect } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Checkbox, Col, Form } from "antd";
import TextArea from "antd/es/input/TextArea";
import { NumberInput } from "@/widgets/numericInputWidgets";
import dayjs from "dayjs";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { useWatch } from "antd/es/form/Form";
import StartEndDateOnlyPickers from "@/widgets/StartEndDateOnlyPickers.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import find from "lodash/find";
import { JazzRow } from "@/widgets/JazzRow";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";
import useHotelSummierer from "@/components/konzert/hotel/useHotelSummierer.ts";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";

export default function HotelCard() {
  const form = useFormInstance<KonzertWithRiderBoxes>();
  const { optionen } = useJazzContext();
  const { hotelpreiseAlsDefault, setHotelpreiseAlsDefault } = useContext(KonzertContext);

  const hotelName = useWatch(["hotel", "name"], { form, preserve: true });
  const eventStartDate = useWatch("startDate", { form, preserve: true });
  const anreiseDate = useWatch(["unterkunft", "anreiseDate"], { form, preserve: true });

  useEffect(() => {
    const start = dayjs(eventStartDate);
    if (start) {
      if (!dayjs(anreiseDate).isAfter(start.subtract(7, "day"))) {
        const end = start.add(1, "day");
        form.setFieldValue(["unterkunft", "anreiseDate"], start);
        form.setFieldValue(["unterkunft", "abreiseDate"], end);
      }
    }
  }, [anreiseDate, eventStartDate, form]);

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

  const { anzNacht, roomsTotalEUR } = useHotelSummierer();

  return (
    <Collapsible amount={roomsTotalEUR} label="Zimmer" suffix="hotel">
      <JazzRow>
        <Col span={12}>
          <StartEndDateOnlyPickers
            dependency="startDate"
            label="An- und Abreise"
            names={[
              ["unterkunft", "anreiseDate"],
              ["unterkunft", "abreiseDate"],
            ]}
          />
          {anzNacht}
        </Col>
        <Col span={12}>
          <Form.Item label={<b>Kommentar:</b>} name={["unterkunft", "kommentar"]}>
            <TextArea rows={7} />
          </Form.Item>
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={3}>
          <NumberInput decimals={0} label="Einzel" name={["unterkunft", "einzelNum"]} />
        </Col>
        <Col span={5}>
          <NumberInput decimals={2} label="Preis" name={["unterkunft", "einzelEUR"]} suffix="€" />
        </Col>
        <Col span={3}>
          <NumberInput decimals={0} label="Doppel" name={["unterkunft", "doppelNum"]} />
        </Col>
        <Col span={5}>
          <NumberInput decimals={2} label="Preis" name={["unterkunft", "doppelEUR"]} suffix="€" />
        </Col>
        <Col span={3}>
          <NumberInput decimals={0} label="Suite" name={["unterkunft", "suiteNum"]} />
        </Col>
        <Col span={5}>
          <NumberInput decimals={2} label="Preis" name={["unterkunft", "suiteEUR"]} suffix="€" />
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={24}>
          <Checkbox checked={hotelpreiseAlsDefault} onChange={(e) => setHotelpreiseAlsDefault(e.target.checked)}>
            <b>Preise als Default übernehmen</b>
          </Checkbox>
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
