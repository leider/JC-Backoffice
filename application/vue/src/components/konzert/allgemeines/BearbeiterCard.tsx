import React, { useContext } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Row } from "antd";
import { ChangelistItem } from "jc-shared/konzert/konzert.ts";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";

export default function BearbeiterCard() {
  const konzertContext = useContext(KonzertContext);
  const form = konzertContext!.form;

  return (
    <Collapsible suffix="allgemeines" label="Historie">
      <h3>Obsolet, jetzt im Menu "Mehr... : Änderungsverlauf"</h3>
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
