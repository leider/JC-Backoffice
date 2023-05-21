import React, { useEffect, useState } from "react";
import Renderer from "jc-shared/commons/renderer";
import VeranstaltungFormatter from "jc-shared/veranstaltung/veranstaltungFormatter";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";

export function PressePreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  function updatePreview(veranstaltung: Veranstaltung) {
    setPreview(
      Renderer.render(`${new VeranstaltungFormatter(veranstaltung).presseTemplate + veranstaltung.presse.text}
${veranstaltung.presse.fullyQualifiedJazzclubURL}`) +
        `<h4>Bilder:</h4>${veranstaltung.presse.image
          .map((i) => `<p><img src="/imagepreview/${i}" width="100%"></p>`)
          .reverse()
          .join("")}`
    );
  }

  const [preview, setPreview] = useState("");
  useEffect(() => {
    updatePreview(veranstaltung);
  }, [veranstaltung]);

  return <div dangerouslySetInnerHTML={{ __html: preview }} />;
}
