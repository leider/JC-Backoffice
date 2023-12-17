import OptionValues from "jc-shared/optionen/optionValues";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Checkbox, Col, Form, Row, Select, SelectProps } from "antd";
import { TextField } from "@/widgets/TextField";
import StartEndPickers from "@/widgets/StartEndPickers";
import SingleSelect from "@/widgets/SingleSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import { useAuth } from "@/commons/authConsts.ts";
import PreisprofilSelect from "@/widgets/PreisprofilSelect";
import { fromFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import groupBy from "lodash/groupBy";

function EventTypeSelect(props: SelectProps & { optionen: OptionValues }) {
  const typByName = useMemo(() => {
    return groupBy(props.optionen.typenPlus || [], "name");
  }, [props.optionen]);

  const typToDisplay = useCallback(
    (typ: string) => {
      const color = typByName[typ]?.[0].color;
      return {
        label: <span style={{ color }}>{typ}</span>,
        value: typ,
      };
    },
    [typByName],
  );

  const eventTypes = useMemo(() => props.optionen.typen.map(typToDisplay), [props.optionen.typen, typToDisplay]);

  return <Select options={eventTypes} {...props} showSearch />;
}

export default function EventCard() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;
  const optionen = veranstContext!.optionen;
  const orte = veranstContext!.orte;

  const { context } = useAuth();

  const [isBookingTeam, setIsBookingTeam] = useState<boolean>(false);
  useEffect(() => {
    setIsBookingTeam(!!context?.currentUser.accessrights?.isBookingTeam);
  }, [context]);

  function ortChanged() {
    const veranstaltung = fromFormObject(form);
    const selectedOrt = orte.orte.find((o) => o.name === veranstaltung.kopf.ort);
    if (selectedOrt) {
      form.setFieldsValue({
        kopf: {
          pressename: selectedOrt.pressename || veranstaltung.kopf.ort,
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

  function Checker({ name, label, disabled }: { label: string; name: string[]; disabled?: boolean }) {
    return (
      <Col span={6}>
        <CheckItem name={name} label={label} disabled={disabled} />
      </Col>
    );
  }

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Event" noTopBorder>
      <Row gutter={12}>
        <Checker label="Ist bestätigt" name={["kopf", "confirmed"]} disabled={!isBookingTeam} />
        <Checker label="Technik ist geklärt" name={["technik", "checked"]} />
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
          <Form.Item label={<b>Typ:</b>} name={["kopf", "eventTyp"]} required rules={[{ required: true }]}>
            <EventTypeSelect optionen={optionen} />
          </Form.Item>
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
          <NumberInput name={["kosten", "saalmiete"]} label="Saalmiete" decimals={2} suffix="€" />
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
    </CollapsibleForVeranstaltung>
  );
}
