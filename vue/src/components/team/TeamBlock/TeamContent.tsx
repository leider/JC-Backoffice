import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { Divider } from "antd";
import TeamStaffRow from "@/components/team/TeamBlock/TeamStaffRow.tsx";
import React, { useEffect, useState } from "react";

interface ContentProps {
  veranstaltung: Veranstaltung;
}

export default function TeamContent({ veranstaltung }: ContentProps) {
  const dividerStyle = {
    marginTop: "4px",
    marginBottom: "4px",
    fontWeight: 600,
  };

  const [kasseNeeded, setKasseNeeded] = useState(true);
  const [technikerNeeded, setTechnikerNeeded] = useState(true);
  const [masterNeeded, setMasterNeeded] = useState(true);
  const [merchNeeded, setMerchNeeded] = useState(true);

  useEffect(() => {
    setKasseNeeded(!(veranstaltung.staff.kasseVNotNeeded && veranstaltung.staff.kasseNotNeeded));
    setTechnikerNeeded(!(veranstaltung.staff.technikerVNotNeeded && veranstaltung.staff.technikerNotNeeded));
    setMasterNeeded(!veranstaltung.staff.modNotNeeded);
    setMerchNeeded(!veranstaltung.staff.merchandiseNotNeeded);
  }, [veranstaltung]);

  return (
    <div style={{ padding: 8 }}>
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
      <TeamStaffRow label="Eins:" sectionName="technikerV" veranstaltung={veranstaltung} />
      <TeamStaffRow label="Zwei:" sectionName="techniker" veranstaltung={veranstaltung} />
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
  );
}
