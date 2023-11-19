import { Col, Form, Row } from "antd";
import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { TextField } from "@/widgets/TextField";
import TextArea from "antd/es/input/TextArea";

export default function VertragspartnerCard() {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Vertragspartner">
      <Row gutter={12}>
        <Col span={24}>
          <TextField name={["vertragspartner", "name"]} label="Name" />
          <Form.Item label={<b>Adresse:</b>} name={["vertragspartner", "adresse"]}>
            <TextArea rows={7} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <TextField name={["vertragspartner", "telefon"]} label="Telefon" />
        </Col>
        <Col span={12}>
          <TextField name={["vertragspartner", "email"]} label="E-Mail" isEmail />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
