import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";
import renderer from "jc-shared/commons/renderer.ts";
import React from "react";
import Konzert from "../../../../../shared/konzert/konzert.ts";

export default function InfoInPreview({ veranstaltung }: { veranstaltung: Konzert }) {
  return (
    veranstaltung.kopf.beschreibung?.trim() && (
      <CollapsibleForVeranstaltung suffix="allgemeines" label="Informationen">
        <div
          dangerouslySetInnerHTML={{
            __html: renderer.render(veranstaltung.kopf.beschreibung),
          }}
        />
      </CollapsibleForVeranstaltung>
    )
  );
}
