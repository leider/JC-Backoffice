import React from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Row } from "antd";
import { Link } from "react-router-dom";
import { MarkdownEditor } from "@/widgets/MarkdownEditor.tsx";

export default function KommentarCard({ forVermietung = false }: { forVermietung?: boolean }) {
  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Kommentar">
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
    </CollapsibleForVeranstaltung>
  );
}
