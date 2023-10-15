import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import React, { useEffect, useState } from "react";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Checkbox, Col, Form, FormInstance, Row, Select, SelectProps } from "antd";
import { TextField } from "@/widgets/TextField";
import StartEndPickers from "@/widgets/StartEndPickers";
import SingleSelect from "@/widgets/SingleSelect";
import { NumberInput } from "@/widgets/numericInputWidgets";
import CheckItem from "@/widgets/CheckItem";
import { useAuth } from "@/commons/auth";
import PreisprofilSelect from "@/widgets/PreisprofilSelect";
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
