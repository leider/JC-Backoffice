import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";

export default function KommentarCard() {
  return (
    <Collapsible label="Kommentar" suffix="allgemeines">
      <JazzRow>
        <Col span={24}>
          <MarkdownEditor label={<b>Zusätzliche Infos:</b>} name={["kopf", "beschreibung"]} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
