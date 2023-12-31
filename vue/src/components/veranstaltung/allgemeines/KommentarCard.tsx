import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, Row } from "antd";
import SimpleMdeReact from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import { Link } from "react-router-dom";

export default function KommentarCard() {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Kommentar">
      <Row gutter={12}>
        <Col span={24}>
          <Link to={`?page=gaeste`}>
            <b>Reservierungen und Gäasteliste jetzt unter diesem Tab!</b>
          </Link>
          <Form.Item label={<b>Zusätzliche Infos:</b>} name={["kopf", "beschreibung"]}>
            <SimpleMdeReact options={{ status: false, spellChecker: false }} />
          </Form.Item>
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
