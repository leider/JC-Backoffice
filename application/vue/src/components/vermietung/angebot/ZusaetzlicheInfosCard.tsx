import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Row } from "antd";
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";

export default function ZusaetzlicheInfosCard() {
  return (
    <Collapsible suffix="angebot" label="Kommentar" noTopBorder>
      <Row gutter={12}>
        <Col span={24}>
          <MarkdownEditor label={<b>Zusätzliche Infos:</b>} name={["angebot", "beschreibung"]} />
        </Col>
      </Row>
    </Collapsible>
  );
}
