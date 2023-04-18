import { TextField } from "@/widgets-react/TextField";
import { Checkbox, Col, Collapse, DatePicker, Form, Input, Row, Select, Space, TimePicker } from "antd";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import React, { useEffect, useState } from "react";
import OptionValues from "jc-shared/optionen/optionValues";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import StartEndPickers from "@/widgets-react/StartEndPickers";
import Orte from "jc-shared/optionen/orte";
import SingleSelect from "@/widgets-react/SingleSelect";
import { NumberInput } from "@/widgets-react/numericInputWidgets";
import CollapsibleForEvents from "@/components/veranstaltung/CollapsibleForEvents";
import MultiSelectWithTags from "@/widgets-react/MultiSelectWithTags";
import Kosten from "jc-shared/veranstaltung/kosten";

function EventCard(props: { optionen: OptionValues; orte: Orte }) {
  const [eventTypes, setEventTypes] = useState();
  const [preisprofile, setPreisprofile] = useState([]);
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

    const localPreisprofile = props.optionen.preisprofile().map((profil) => ({
      label: (
        <span>
          {profil.name}
          <small>
            &nbsp;
            {`(${profil.regulaer},00, ${profil.regulaer - profil.rabattErmaessigt},00, ${profil.regulaer - profil.rabattMitglied},00)`}
          </small>
        </span>
      ),
      value: profil.name,
    }));
    setPreisprofile(localPreisprofile);
  }, [props.optionen]);
  const [expanded, setExpanded] = useState("event");
  return (
    <Collapse
      className="tab-allgemeines"
      activeKey={expanded}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color="#fff" /> : <CaretRight color="#fff  " />)}
      onChange={(key) => setExpanded(key)}
    >
      <Collapse.Panel key="event" className="color-allgemeines" header={<span className="color-allgemeines">Event</span>}>
        <Row gutter={12}>
          <Col span={12}>
            <TextField name={["kopf", "titel"]} label="Titel" />
          </Col>
          <Col span={12}>
            <Form.Item label={<b>Typ:</b>} name={["kopf", "eventTyp"]}>
              <Select options={eventTypes} />
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
            <SingleSelect name={["kopf", "ort"]} label="Ort" options={props.orte.alleNamen()} />
          </Col>
          <Col span={8}>
            <NumberInput name={["kopf", "flaeche"]} label="Fläche" decimals={0} />
          </Col>
          <Col span={8}>
            <NumberInput name={["kopf", "saalmiete"]} label="Saalmiete" decimals={2} suffix="€" />
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
            <Form.Item label={<b>Preisprofil:</b>} name={["eintrittspreise", "preisprofil"]}>
              <Select options={preisprofile} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <SingleSelect name={["kopf", "genre"]} label="Genre" options={props.optionen.genres} />
          </Col>
        </Row>
      </Collapse.Panel>
    </Collapse>
  );
}

function ArtistCard(props: { optionen: OptionValues; orte: Orte }) {
  return (
    <CollapsibleForEvents suffix="allgemeines" label="Künstler" style={{ marginTop: "16px" }}>
      <Row gutter={12}>
        <Col span={12}>
          <TextField name={["artist", "bandname"]} label="Bandname" />
        </Col>
        <Col span={6}>
          <NumberInput name={["artist", "numMusiker"]} label="Musiker" decimals={0} min={0} />
        </Col>
        <Col span={6}>
          <NumberInput name={["artist", "numCrew"]} label="Crew" decimals={0} min={0} />
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <MultiSelectWithTags name={["artist", "name"]} label="Namen" options={props.optionen.artists} />
        </Col>
        <Col span={6}>
          <NumberInput name={["kosten", "gagenEUR"]} label="Gage (Netto)" decimals={2} suffix="€" />
        </Col>
        <Col span={6}>
          <SingleSelect name={["kosten", "deal"]} label="Deal" options={Kosten.deals} />
        </Col>
      </Row>
    </CollapsibleForEvents>
  );
}

interface TabAllgemeinesProps {
  optionen: OptionValues;
  orte: Orte;
}

export default function TabAllgemeines({ optionen, orte }: TabAllgemeinesProps) {
  return (
    <Row>
      <Col span={12}>
        <EventCard optionen={optionen} orte={orte} />
        <ArtistCard optionen={optionen} orte={orte} />
      </Col>
    </Row>
  );
}
