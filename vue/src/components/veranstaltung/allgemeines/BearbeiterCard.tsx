import React, { useContext } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Row } from "antd";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import { ChangelistItem } from "../../../../../shared/konzert/konzert.ts";

export default function BearbeiterCard() {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Bearbeiter">
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
    </CollapsibleForVeranstaltung>
  );
}
