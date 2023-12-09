import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Form, Row } from "antd";
import { RiderComp } from "@/components/rider/RiderComp.tsx";

export default function RiderCard() {
  return (
    <CollapsibleForVeranstaltung suffix="technik" label="Rider">
      <Row gutter={12}>
        <Col span={24}>
          <Form.Item name="riderBoxes" valuePropName="targetBoxes" trigger="setTargetBoxes">
            <RiderComp />
          </Form.Item>
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
