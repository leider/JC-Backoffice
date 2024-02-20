import Collapsible from "@/widgets/Collapsible.tsx";
import renderer from "jc-shared/commons/renderer.ts";
import React from "react";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

export default function InfoInPreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  return (
    veranstaltung.kopf.beschreibung?.trim() && (
      <Collapsible suffix="allgemeines" label="Informationen">
        <div
          dangerouslySetInnerHTML={{
            __html: renderer.render(veranstaltung.kopf.beschreibung),
          }}
        />
      </Collapsible>
    )
  );
}
