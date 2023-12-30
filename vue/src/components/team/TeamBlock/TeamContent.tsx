import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { Divider } from "antd";
import TeamStaffRow from "@/components/team/TeamBlock/TeamStaffRow.tsx";
import React, { useMemo } from "react";

interface ContentProps {
  veranstaltung: Veranstaltung;
}

export default function TeamContent({ veranstaltung }: ContentProps) {
  const dividerStyle = {
    marginTop: "4px",
    marginBottom: "4px",
    fontWeight: 600,
  };

  const kasseNeeded = useMemo(() => !(veranstaltung.staff.kasseVNotNeeded && veranstaltung.staff.kasseNotNeeded), [veranstaltung]);
  const technikerNeeded = useMemo(
    () => !(veranstaltung.staff.technikerVNotNeeded && veranstaltung.staff.technikerNotNeeded),
    [veranstaltung],
  );
  const masterNeeded = useMemo(() => !veranstaltung.staff.modNotNeeded, [veranstaltung]);
  const merchNeeded = useMemo(() => !veranstaltung.staff.merchandiseNotNeeded, [veranstaltung]);
  const somebodyNeeded = useMemo(
    () => kasseNeeded || technikerNeeded || masterNeeded || merchNeeded,
    [kasseNeeded, masterNeeded, merchNeeded, technikerNeeded],
  );

  return somebodyNeeded ? (
    <div>
      {kasseNeeded && (
        <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
          Kasse
        </Divider>
      )}
      <TeamStaffRow label="Eins:" sectionName="kasseV" veranstaltung={veranstaltung} />
      <TeamStaffRow label="Zwei:" sectionName="kasse" veranstaltung={veranstaltung} />
      {technikerNeeded && (
        <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
          Techniker
        </Divider>
      )}
      <TeamStaffRow label="Ton:" sectionName="technikerV" veranstaltung={veranstaltung} />
      <TeamStaffRow label="Licht:" sectionName="techniker" veranstaltung={veranstaltung} />
      {masterNeeded && (
        <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
          Master
        </Divider>
      )}
      <TeamStaffRow label="&nbsp;" sectionName="mod" veranstaltung={veranstaltung} />
      {merchNeeded && (
        <Divider orientationMargin={0} orientation="left" style={dividerStyle}>
          Merchandise
        </Divider>
      )}
      <TeamStaffRow label="&nbsp;" sectionName="merchandise" veranstaltung={veranstaltung} />
    </div>
  ) : (
    <p>Niemand benötigt.</p>
  );
}
