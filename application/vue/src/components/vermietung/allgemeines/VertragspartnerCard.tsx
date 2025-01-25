import { Col, Form } from "antd";
import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { TextField } from "@/widgets/TextField";
import TextArea from "antd/es/input/TextArea";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function VertragspartnerCard() {
  return (
    <Collapsible suffix="allgemeines" label="Vertragspartner">
      <JazzRow>
        <Col span={24}>
          <TextField name={["vertragspartner", "name"]} label="Name" />
          <Form.Item label={<b>Adresse:</b>} name={["vertragspartner", "adresse"]}>
            <TextArea rows={7} />
          </Form.Item>
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <TextField name={["vertragspartner", "telefon"]} label="Telefon" />
        </Col>
        <Col span={12}>
          <TextField name={["vertragspartner", "email"]} label="E-Mail" isEmail />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
