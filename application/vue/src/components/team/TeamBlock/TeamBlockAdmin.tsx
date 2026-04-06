import React, { memo } from "react";
import AdminContent from "@/components/team/TeamBlock/AdminContent.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { TeamBlockAdminExtras } from "@/components/team/TeamBlock/TeamBlockAdminExtras.tsx";
import TeamBlockCommons from "@/components/team/TeamBlock/TeamBlockCommons.tsx";

type TeamBlockAdminProps = {
  readonly veranstaltung: Veranstaltung;
  readonly initiallyOpen: boolean;
  readonly blockSyncKey: string;
};

function TeamBlockAdmin({ veranstaltung, initiallyOpen }: TeamBlockAdminProps) {
  return (
    <TeamBlockCommons
      contentComponent={<AdminContent veranstaltung={veranstaltung} />}
      extrasExpanded={<TeamBlockAdminExtras veranstaltung={veranstaltung} />}
      initiallyOpen={initiallyOpen}
      veranstaltung={veranstaltung}
    />
  );
}

export default memo(TeamBlockAdmin);
