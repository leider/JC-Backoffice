import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Row } from "antd";
import { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung";

export default function BearbeiterCard({ changelist }: { changelist: ChangelistItem[] }) {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Bearbeiter">
      {changelist?.map((item, idx) => (
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
