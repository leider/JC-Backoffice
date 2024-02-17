import Collapsible from "@/widgets/Collapsible.tsx";
import renderer from "jc-shared/commons/renderer.ts";
import React from "react";
import Konzert from "../../../../../shared/konzert/konzert.ts";

export default function InfoInPreview({ konzert }: { konzert: Konzert }) {
  return (
    konzert.kopf.beschreibung?.trim() && (
      <Collapsible suffix="allgemeines" label="Informationen">
        <div
          dangerouslySetInnerHTML={{
            __html: renderer.render(konzert.kopf.beschreibung),
          }}
        />
      </Collapsible>
    )
  );
}
