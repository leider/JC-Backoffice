import React, { memo } from "react";
import TeamContent from "@/components/team/TeamBlock/TeamContent.tsx";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import TeamBlockCommons from "@/components/team/TeamBlock/TeamBlockCommons.tsx";

type TeamBlockNormalProps = {
  readonly veranstaltung: Veranstaltung;
  readonly initiallyOpen: boolean;
  /** Busts memo when global highlight / memoized veranstaltung changes (see TeamMonatGroup). */
  readonly blockSyncKey: string;
};

function TeamBlockNormal({ veranstaltung, initiallyOpen }: TeamBlockNormalProps) {
  return (
    <TeamBlockCommons
      contentComponent={<TeamContent veranstaltung={veranstaltung} />}
      initiallyOpen={initiallyOpen}
      veranstaltung={veranstaltung}
    />
  );
}

export default memo(TeamBlockNormal);
