import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, Row } from "antd";
import SimpleMdeReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

export default function KommentarCard() {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Kommentar">
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item label={<b>Zusätzliche Infos:</b>} name={["kopf", "beschreibung"]}>
            <SimpleMdeReact options={{ status: false, spellChecker: false }} />
          </Form.Item>
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
