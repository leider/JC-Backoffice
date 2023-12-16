import React, { useEffect, useState } from "react";
import { Image, Space } from "antd";
import { DownloadOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import Renderer from "jc-shared/commons/renderer";
import { imgFullsize } from "@/commons/loader.ts";
import "../../veranstaltung/presse/preview.css";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import VermietungFormatter from "jc-shared/vermietung/vermietungFormatter.ts";
import isEmpty from "lodash/isEmpty";

export function PressePreview({ vermietung }: { vermietung: Vermietung }) {
  function updatePreview(vermietung: Vermietung) {
    const presse = vermietung.presse;
    const textToUse = isEmpty(presse.text) ? presse.originalText : presse.text;
    const infoline1 = presse.checked ? "" : "ACHTUNG: Presse ist NICHT OK\n";
    const infoline2 = isEmpty(presse.text) ? "ACHTUNG: Text NICHT final" : "";
    presse.checked ? "Presse ist OK" : "ACHTUNG: Presse ist NICHT OK\n";
    setPreview(
      Renderer.render(
        `## ${infoline1}
## ${infoline2}
${new VermietungFormatter(vermietung).presseTemplate + textToUse}
${presse.fullyQualifiedJazzclubURL}`,
      ) + `<h4>Bilder:</h4>`,
    );
  }

  const [preview, setPreview] = useState("");
  useEffect(() => {
    updatePreview(vermietung);
  }, [vermietung]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: preview }} />
      {vermietung.presse.image.map((img) => (
        <Image
          key={img}
          src={`/imagepreview/${img}`}
          width={"100%"}
          preview={{
            src: `/upload/${img}`,
            toolbarRender: (_, { transform: { scale }, actions: { onZoomOut, onZoomIn } }) => (
              <Space size={12} className="toolbar-wrapper">
                <DownloadOutlined onClick={() => imgFullsize(img)} />
                <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
                <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
              </Space>
            ),
          }}
        />
      ))}
    </>
  );
}
