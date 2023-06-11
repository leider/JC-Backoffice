import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import React, { useEffect, useState } from "react";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Checkbox, Col, Form, FormInstance, Row, Select, SelectProps } from "antd";
import { TextField } from "@/widgets-react/TextField";
import StartEndPickers from "@/widgets-react/StartEndPickers";
import SingleSelect from "@/widgets-react/SingleSelect";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import CheckItem from "@/widgets-react/CheckItem";
import { useAuth } from "@/commons/auth";
import PreisprofilSelect from "@/widgets-react/PreisprofilSelect";
import { fromFormObject } from "@/components/veranstaltung/veranstaltungCompUtils";

function EventTypeSelect(props: SelectProps & { optionen: OptionValues }) {
  const [eventTypes, setEventTypes] = useState<{ label: JSX.Element; value: string }[]>([]);
  useEffect(() => {
    const localOptionen = props.optionen.typen.map((typ) => ({
      label: (
        <span className={fieldHelpers.cssIconClass(typ)}>
          <span className={`text-${fieldHelpers.cssColorCode(typ)}`} style={{ marginLeft: 8 }}>
            {typ}
          </span>
        </span>
      ),
      value: typ,
    }));
    setEventTypes(localOptionen);
  }, [props.optionen]);

  return <Select options={eventTypes} {...props} />;
}

type EventCardProps = {
  form: FormInstance;
  optionen: OptionValues;
  orte: Orte;
};

export default function EventCard({ form, optionen, orte }: EventCardProps) {
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

  useEffect(ortChanged, [orte]);

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Event" noTopBorder>
      <Row gutter={12}>
        <Col span={8} offset={16}>
          <CheckItem label="ist abgesagt" name={["kopf", "abgesagt"]} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <CheckItem name={["kopf", "confirmed"]} label="Ist bestätigt" disabled={!isBookingTeam} />
        </Col>
        <Col span={8}>
          <CheckItem name={["artist", "brauchtHotel"]} label="Braucht Hotel" />
        </Col>
        <Col span={8}>
          <CheckItem name={["kopf", "fotografBestellen"]} label="Fotograf einladen" />
        </Col>
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
