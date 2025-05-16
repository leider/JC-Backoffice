import { Col, Radio, RadioChangeEvent, Row } from "antd";
import { PressePreview } from "@/components/veranstaltung/presse/PressePreview.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import React, { useCallback, useState } from "react";

export default function ModalContentForCallback({ verForPreview }: { readonly verForPreview: Veranstaltung }) {
  const [previewWidth, setPreviewWidth] = useState(24);
  const selectButton = useCallback((event: RadioChangeEvent) => setPreviewWidth(event.target.value), [setPreviewWidth]);
  return (
    <div style={{ height: "70vh", overflow: "scroll" }}>
      <ul>
        <li>Passen die Umbrüche?</li>
        <li>Hast Du manuelle Trennzeichen?</li>
        <li>Werden die Bilder alle angezeigt?</li>
        <li>Stimmen die Links?</li>
      </ul>
      <hr />
      <Radio.Group
        buttonStyle="solid"
        defaultValue={24}
        onChange={selectButton}
        optionType="button"
        options={[
          { label: "schmal", value: 6 },
          { label: "mittel", value: 12 },
          { label: "breit", value: 24 },
        ]}
      />
      <Row>
        <Col span={previewWidth}>
          <PressePreview smallImages veranstaltung={verForPreview} />
        </Col>
      </Row>
    </div>
  );
}
