import React, { useEffect, useState } from "react";
import { Image, Space } from "antd";
import Renderer from "jc-shared/commons/renderer.ts";
import { imgFullsize } from "@/commons/loader.ts";
import "./preview.css";
import isEmpty from "lodash/isEmpty";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import ButtonForImagePreview from "@/components/veranstaltung/presse/ButtonForImagePreview.tsx";
import VeranstaltungVermietungFormatter from "jc-shared/veranstaltung/VeranstaltungVermietungFormatter.ts";
import Konzert from "jc-shared/konzert/konzert.ts";

export function PressePreview({ veranstVermiet }: { veranstVermiet: Konzert | Vermietung }) {
  function updatePreview(veranstVermiet: Konzert | Vermietung) {
    const presse = veranstVermiet.presse;
    const textToUse = isEmpty(presse.text) ? presse.originalText : presse.text;
    const infoline1 = presse.checked ? "" : "ACHTUNG: Presse ist NICHT OK\n";
    const infoline2 = isEmpty(presse.text) ? "ACHTUNG: Text NICHT final" : "";
    presse.checked ? "Presse ist OK" : "ACHTUNG: Presse ist NICHT OK\n";
    setPreview(
      Renderer.render(
        `## ${infoline1}
## ${infoline2}
${new VeranstaltungVermietungFormatter(veranstVermiet).presseTemplate + textToUse}
${presse.fullyQualifiedJazzclubURL}`,
      ) + `<h4>Bilder:</h4>`,
    );
  }

  const [preview, setPreview] = useState("");
  useEffect(() => {
    updatePreview(veranstVermiet);
  }, [veranstVermiet]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: preview }} />
      {veranstVermiet.presse.image.map((img) => (
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
