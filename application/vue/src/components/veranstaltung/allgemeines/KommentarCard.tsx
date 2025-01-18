import React from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, Row } from "antd";
import { Link } from "react-router";
import { MarkdownEditor } from "@/widgets/markdown/MarkdownEditor.tsx";

export default function KommentarCard({ forVermietung = false }: { forVermietung?: boolean }) {
  return (
    <Collapsible suffix="allgemeines" label="Kommentar">
      <Row gutter={12}>
        <Col span={24}>
          {!forVermietung && (
            <b>
              Reservierungen und Gästeliste jetzt unter
              <Link to={`?page=gaeste`}> diesem Tab!</Link>
            </b>
          )}
          <MarkdownEditor label={<b>Zusätzliche Infos:</b>} name={["kopf", "beschreibung"]} />
        </Col>
      </Row>
    </Collapsible>
  );
}
