import React, { useContext } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Row } from "antd";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import { ChangelistItem } from "jc-shared/veranstaltung/veranstaltung.ts";

export default function BearbeiterCard() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Bearbeiter">
      {form.getFieldValue("changelist")?.map((item: ChangelistItem) => (
        <Row gutter={12} key={item.zeitpunkt}>
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
