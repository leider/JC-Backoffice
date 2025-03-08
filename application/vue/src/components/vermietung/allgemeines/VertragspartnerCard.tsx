import { Col, Form } from "antd";
import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { TextField } from "@/widgets/TextField";
import TextArea from "antd/es/input/TextArea";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function VertragspartnerCard() {
  return (
    <Collapsible label="Vertragspartner" suffix="allgemeines">
      <JazzRow>
        <Col span={24}>
          <TextField label="Name" name={["vertragspartner", "name"]} />
          <Form.Item label={<b>Adresse:</b>} name={["vertragspartner", "adresse"]}>
            <TextArea rows={7} />
          </Form.Item>
        </Col>
      </JazzRow>
      <JazzRow>
        <Col span={12}>
          <TextField label="Telefon" name={["vertragspartner", "telefon"]} />
        </Col>
        <Col span={12}>
          <TextField isEmail label="E-Mail" name={["vertragspartner", "email"]} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
