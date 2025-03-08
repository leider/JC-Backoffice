import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { ChangelistItem } from "jc-shared/konzert/konzert.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { useWatch } from "antd/es/form/Form";
import map from "lodash/map";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function BearbeiterCard() {
  const form = useFormInstance();

  const changelist = useWatch("changelist", { form, preserve: true });
  return (
    !!changelist?.length && (
      <Collapsible label="Historie" suffix="allgemeines" uncollapsed>
        <h3>Obsolet, jetzt im Menu "Mehr... : Änderungsverlauf"</h3>
        {map(changelist, (item: ChangelistItem, idx: number) => (
          <JazzRow key={idx}>
            <Col span={24}>
              <details>
                <summary>
                  {item.zeitpunkt} {item.bearbeiter}
                </summary>
                <pre>{item.diff}</pre>
              </details>
            </Col>
          </JazzRow>
        ))}
      </Collapsible>
    )
  );
}
