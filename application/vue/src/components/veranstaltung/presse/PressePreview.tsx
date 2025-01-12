import React, { useEffect, useState } from "react";
import { Image, Space } from "antd";
import Renderer from "jc-shared/commons/renderer.ts";
import { imgFullsize } from "@/commons/loader.ts";
import "./preview.css";
import isEmpty from "lodash/isEmpty";
import ButtonForImagePreview from "@/components/veranstaltung/presse/ButtonForImagePreview.tsx";
import VeranstaltungFormatter from "jc-shared/veranstaltung/VeranstaltungFormatter.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import map from "lodash/map";

export function PressePreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  function updatePreview(veranstaltung: Veranstaltung) {
    const presse = veranstaltung.presse;
    const textToUse = isEmpty(presse.text) ? presse.originalText : presse.text;
    const infoline1 = presse.checked ? "" : "ACHTUNG: Presse ist NICHT OK\n";
    const infoline2 = isEmpty(presse.text) ? "ACHTUNG: Text NICHT final" : "";
    presse.checked ? "Presse ist OK" : "ACHTUNG: Presse ist NICHT OK\n";
    setPreview(
      Renderer.render(
        `## ${infoline1}
## ${infoline2}
${new VeranstaltungFormatter(veranstaltung).presseTemplate + textToUse}
${presse.fullyQualifiedJazzclubURL}`,
      ) + `<h4>Bilder:</h4>`,
    );
  }

  const [preview, setPreview] = useState("");
  useEffect(() => {
    updatePreview(veranstaltung);
  }, [veranstaltung]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: preview }} />
      {map(veranstaltung.presse.image, (img) => (
        <Image
          key={img}
          src={`/imagepreview/${img}`}
          width={"100%"}
          preview={{
            src: `/upload/${img}`,
            toolbarRender: (_, { transform: { scale }, actions: { onZoomOut, onZoomIn } }) => (
              <Space size={12} className="toolbar-wrapper">
                <ButtonForImagePreview icon="Download" onClick={() => imgFullsize(img)} />
                <ButtonForImagePreview icon="ZoomOut" onClick={onZoomOut} disabled={scale === 1} />
                <ButtonForImagePreview icon="ZoomIn" onClick={onZoomIn} disabled={scale === 50} />
              </Space>
            ),
          }}
        />
      ))}
    </>
  );
}
