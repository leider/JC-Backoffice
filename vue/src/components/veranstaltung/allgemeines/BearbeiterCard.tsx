import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Row } from "antd";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

export default function BearbeiterCard({ veranstaltung }: { veranstaltung?: Veranstaltung }) {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Bearbeiter">
      {veranstaltung?.changelist?.map((item, idx) => (
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
    </CollapsibleForVeranstaltung>
  );
}
