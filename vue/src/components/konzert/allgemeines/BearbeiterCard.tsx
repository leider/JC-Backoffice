import React, { useContext } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Form, Row } from "antd";
import { Changelog } from "@/components/history/Changelog.tsx";
import { ChangelistItem } from "jc-shared/konzert/konzert.ts";
import { KonzertContext } from "@/components/konzert/KonzertComp.tsx";

export default function BearbeiterCard() {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;

  return (
    <Collapsible suffix="allgemeines" label="Historie">
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item name="id" valuePropName="id">
            <Changelog collection="Veranstaltung" />
          </Form.Item>
        </Col>
      </Row>
      {form.getFieldValue("changelist")?.map((item: ChangelistItem, idx: number) => (
        <Row gutter={12} key={idx}>
          <Col span={24}>
            <details>
              <summary>
                {item.zeitpunkt} {item.bearbeiter}
              </summary>
              <pre>{item.diff}</pre>
            </details>
          </Col>
        </Row>
      ))}
    </Collapsible>
  );
}
