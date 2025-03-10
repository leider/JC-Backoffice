import React, { useEffect, useState } from "react";
import Renderer from "jc-shared/commons/renderer.ts";
import "./preview.css";
import isEmpty from "lodash/isEmpty";
import VeranstaltungFormatter from "jc-shared/veranstaltung/VeranstaltungFormatter.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import map from "lodash/map";
import JazzImage from "@/widgets/JazzImage.tsx";

export function PressePreview({ veranstaltung }: { readonly veranstaltung: Veranstaltung }) {
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
        <JazzImage img={img} key={img} width="100%" />
      ))}
    </>
  );
}
