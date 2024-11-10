import React, { useContext, useEffect, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Checkbox, Col, Form, Row } from "antd";
import { TextField } from "@/widgets/TextField";
import SingleSelect from "@/widgets/SingleSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import PreisprofilSelect from "@/widgets/PreisprofilSelect";
import { KonzertContext } from "@/components/konzert/KonzertComp";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import StartEndPickers from "@/widgets/StartEndPickers.tsx";
import Konzert from "jc-shared/konzert/konzert.ts";
import { EventTypeSelect } from "@/widgets/EventTypeSelect.tsx";

export default function EventCard() {
  const konzertContext = useContext(KonzertContext);
  const { optionen, orte } = useJazzContext();
  const form = konzertContext!.form;

  const { currentUser } = useJazzContext();

  const isBookingTeam = useMemo(() => currentUser.accessrights.isBookingTeam, [currentUser.accessrights.isBookingTeam]);

  function ortChanged() {
    const konzert = new Konzert(form.getFieldsValue(true));
    const selectedOrt = orte.orte.find((o) => o.name === konzert.kopf.ort);
    if (selectedOrt) {
      form.setFieldsValue({
        kopf: {
          pressename: selectedOrt.pressename || konzert.kopf.ort,
          presseIn: selectedOrt.presseIn || selectedOrt.pressename,
          flaeche: selectedOrt.flaeche,
        },
      });
    }

    form.validateFields();
  }

  useEffect(
    ortChanged, // eslint-disable-next-line react-hooks/exhaustive-deps
    [orte],
  );

  function Checker({ name, label, disabled }: { label: string; name: string | string[]; disabled?: boolean }) {
    return (
      <Col span={6}>
        <CheckItem name={name} label={label} disabled={disabled} />
      </Col>
    );
  }

  return (
    <Collapsible suffix="allgemeines" label="Event" noTopBorder>
      <Row gutter={12}>
        <Checker label="Ist bestätigt" name={["kopf", "confirmed"]} disabled={!isBookingTeam} />
        <Checker label="Technik ist geklärt" name={["technik", "checked"]} />
        <Checker label="Braucht Presse" name="brauchtPresse" />
        <Checker label="Presse OK" name={["presse", "checked"]} />
        <Checker label="Ist abgesagt" name={["kopf", "abgesagt"]} />
        <Checker label="Braucht Hotel" name={["artist", "brauchtHotel"]} />
        <Checker label="Flügel stimmen" name={["technik", "fluegel"]} />
        <Checker label="Fotograf einladen" name={["kopf", "fotografBestellen"]} />
        <Checker label="Kann Homepage" name={["kopf", "kannAufHomePage"]} />
        <Checker label="Kann Social Media" name={["kopf", "kannInSocialMedia"]} />
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <TextField name={["kopf", "titel"]} label="Titel" required />
        </Col>
        <Col span={12}>
          <EventTypeSelect />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <StartEndPickers />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <SingleSelect name={["kopf", "ort"]} label="Ort" options={orte.alleNamen()} onChange={ortChanged} />
        </Col>
        <Col span={8}>
          <NumberInput name={["kopf", "flaeche"]} label="Fläche" decimals={0} />
        </Col>
        <Col span={8}>
          <NumberInput name={["kosten", "saalmiete"]} label="Saalmiete (alt)" decimals={2} suffix="€" disabled />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={7}>
          <SingleSelect name={["kopf", "kooperation"]} label="Koop (Rechnung)" options={optionen.kooperationen} />
        </Col>
        <Col span={1}>
          <Form.Item name={["kopf", "rechnungAnKooperation"]} label="&nbsp;" valuePropName="checked">
            <Checkbox></Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <PreisprofilSelect form={form} optionen={optionen} />
        </Col>
        <Col span={8}>
          <SingleSelect name={["kopf", "genre"]} label="Genre" options={optionen.genres} />
        </Col>
      </Row>
    </Collapsible>
  );
}
