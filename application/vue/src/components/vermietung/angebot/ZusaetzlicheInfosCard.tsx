import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col } from "antd";
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";
import { JazzRow } from "@/widgets/JazzRow.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";

export default function ZusaetzlicheInfosCard() {
  const { lg } = useBreakpoint();
  return (
    <Collapsible label="Kommentar" noTopBorder={lg} suffix="angebot">
      <JazzRow>
        <Col span={24}>
          <MarkdownEditor label={<b>Zusätzliche Infos:</b>} name={["angebot", "beschreibung"]} />
        </Col>
      </JazzRow>
    </Collapsible>
  );
}
