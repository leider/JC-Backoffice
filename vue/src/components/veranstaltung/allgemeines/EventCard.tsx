import OptionValues from "jc-shared/optionen/optionValues";
import Orte from "jc-shared/optionen/orte";
import React, { useEffect, useState } from "react";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Checkbox, Col, Form, FormInstance, Row, Select } from "antd";
import { TextField } from "@/widgets-react/TextField";
import StartEndPickers from "@/widgets-react/StartEndPickers";
import SingleSelect from "@/widgets-react/SingleSelect";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import CheckItem from "@/widgets-react/CheckItem";
import { useAuth } from "@/commons/auth";
import PreisprofilSelect from "@/widgets-react/PreisprofilSelect";

export default function EventCard(props: {
  form: FormInstance;
  optionen: OptionValues;
  orte: Orte;
  brauchtHotelCallback: (brauchtHotel: boolean) => void;
  titleAndDateCallback: () => void;
}) {
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
  const { context } = useAuth();

  const [isBookingTeam, setIsBookingTeam] = useState<boolean>(false);
  useEffect(() => {
    setIsBookingTeam(!!context?.currentUser.accessrights?.isBookingTeam);
  }, [context]);

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Event" noTopBorder>
      <Row gutter={12}>
        <Col span={8} offset={16}>
          <CheckItem label="ist abgesagt" name={["kopf", "abgesagt"]} onChange={props.titleAndDateCallback} />
        </Col>
      </Row>
      <Row gutter={12}>
        {isBookingTeam && (
          <Col span={8}>
            <CheckItem name={["kopf", "confirmed"]} label="Ist bestätigt" onChange={props.titleAndDateCallback} />
          </Col>
        )}
        <Col span={8}>
          <CheckItem
            name={["artist", "brauchtHotel"]}
            label="Braucht Hotel"
            onChange={(e) => {
              props.brauchtHotelCallback(e.target.checked);
            }}
          />
        </Col>
        <Col span={8}>
          <CheckItem name={["kopf", "fotografBestellen"]} label="Fotograf einladen" />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <TextField name={["kopf", "titel"]} label="Titel" onChange={props.titleAndDateCallback} />
        </Col>
        <Col span={12}>
          <Form.Item label={<b>Typ:</b>} name={["kopf", "eventTyp"]}>
            <Select options={eventTypes} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <StartEndPickers onChange={props.titleAndDateCallback} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={8}>
          <SingleSelect name={["kopf", "ort"]} label="Ort" options={props.orte.alleNamen()} onChange={props.titleAndDateCallback} />
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
          <SingleSelect name={["kopf", "kooperation"]} label="Koop (Rechnung)" options={props.optionen.kooperationen} />
        </Col>
        <Col span={1}>
          <Form.Item name={["kopf", "rechnungAnKooperation"]} label="&nbsp;" valuePropName="checked">
            <Checkbox></Checkbox>
          </Form.Item>
        </Col>
        <Col span={8}>
          <PreisprofilSelect form={props.form} optionen={props.optionen} />
        </Col>
        <Col span={8}>
          <SingleSelect name={["kopf", "genre"]} label="Genre" options={props.optionen.genres} />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
