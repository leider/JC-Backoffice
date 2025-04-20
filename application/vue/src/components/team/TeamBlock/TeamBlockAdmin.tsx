import React from "react";
import AdminContent from "@/components/team/TeamBlock/AdminContent.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { TeamBlockAdminExtras } from "@/components/team/TeamBlock/TeamBlockAdminExtras.tsx";
import TeamBlockCommons from "@/components/team/TeamBlock/TeamBlockCommons.tsx";

export default function TeamBlockAdmin({
  veranstaltung,
  initiallyOpen,
}: {
  readonly veranstaltung: Veranstaltung;
  readonly initiallyOpen: boolean;
}) {
  return (
    <TeamBlockCommons
      contentComponent={<AdminContent veranstaltung={veranstaltung} />}
      extrasExpanded={<TeamBlockAdminExtras veranstaltung={veranstaltung} />}
      initiallyOpen={initiallyOpen}
      veranstaltung={veranstaltung}
    />
  );
}
