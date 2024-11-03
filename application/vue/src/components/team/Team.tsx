import React from "react";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { TeamUndVeranstaltungen } from "@/components/team/TeamUndVeranstaltungen.tsx";

export default function Team() {
  useDirtyBlocker(false);
  document.title = "Team";

  return <TeamUndVeranstaltungen periodsToShow={["zukuenftige", "vergangene"]} />;
}
