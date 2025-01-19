import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function ZusaetzlicheInfosCard() {
  return (
    <Collapsible suffix="angebot" label="Kommentar" noTopBorder>
      <JazzRow>
        <Col span={24}>
          <MarkdownEditor label={<b>Zusätzliche Infos:</b>} name={["angebot", "beschreibung"]} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
