import React from "react";
import TeamContent from "@/components/team/TeamBlock/TeamContent.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import TeamBlockCommons from "@/components/team/TeamBlock/TeamBlockCommons.tsx";

export default function TeamBlockNormal({
  veranstaltung,
  initiallyOpen,
}: {
  readonly veranstaltung: Veranstaltung;
  readonly initiallyOpen: boolean;
}) {
  return (
    <TeamBlockCommons
      contentComponent={<TeamContent veranstaltung={veranstaltung} />}
      initiallyOpen={initiallyOpen}
      veranstaltung={veranstaltung}
    />
  );
}
