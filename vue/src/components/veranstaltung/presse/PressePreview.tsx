import React, { useEffect, useState } from "react";
import { Image, Space } from "antd";
import Renderer from "jc-shared/commons/renderer";
import VeranstaltungVermietungFormatter from "../../../../../shared/veranstaltung/VeranstaltungVermietungFormatter.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { imgFullsize } from "@/commons/loader.ts";
import "./preview.css";
import isEmpty from "lodash/isEmpty";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";

export function PressePreview({ veranstVermiet }: { veranstVermiet: Veranstaltung | Vermietung }) {
  function updatePreview(veranstVermiet: Veranstaltung | Vermietung) {
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
                <ButtonWithIcon type="text" icon="Download" iconColor="white" onClick={() => imgFullsize(img)} />
                <ButtonWithIcon type="text" icon="ZoomOut" iconColor="white" onClick={onZoomOut} disabled={scale === 1} />
                <ButtonWithIcon type="text" icon="ZoomIn" iconColor="white" onClick={onZoomIn} disabled={scale === 50} />
              </Space>
            ),
          }}
        />
      ))}
    </>
  );
}
