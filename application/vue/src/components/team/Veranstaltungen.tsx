import React from "react";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { TeamUndVeranstaltungen } from "@/components/team/TeamUndVeranstaltungen.tsx";

export default function Veranstaltungen() {
  useDirtyBlocker(false);
  document.title = "Veranstaltungen";

  return <TeamUndVeranstaltungen periodsToShow={["zukuenftige", "vergangene", "alle"]} />;
}
