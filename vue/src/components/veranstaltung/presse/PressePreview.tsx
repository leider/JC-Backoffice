import React, { useEffect, useState } from "react";
import Renderer from "jc-shared/commons/renderer";
import VeranstaltungFormatter from "jc-shared/veranstaltung/veranstaltungFormatter";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import _ from "lodash";

export function PressePreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  function updatePreview(veranstaltung: Veranstaltung) {
    const presse = veranstaltung.presse;
    const textToUse = _.isEmpty(presse.text) ? presse.originalText : presse.text;
    const infoline1 = presse.checked ? "" : "ACHTUNG: Presse ist NICHT OK\n";
    const infoline2 = _.isEmpty(presse.text) ? "ACHTUNG: Text NICHT final" : "";
    presse.checked ? "Presse ist OK" : "ACHTUNG: Presse ist NICHT OK\n";
    setPreview(
      Renderer.render(
        `## ${infoline1}
## ${infoline2}
${new VeranstaltungFormatter(veranstaltung).presseTemplate + textToUse}
${presse.fullyQualifiedJazzclubURL}`
      ) +
        `<h4>Bilder:</h4>${presse.image
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
