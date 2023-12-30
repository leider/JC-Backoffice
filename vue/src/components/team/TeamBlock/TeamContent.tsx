import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { List } from "antd";
import { ActionButton, ActiveUsers } from "@/components/team/TeamBlock/TeamStaffRow.tsx";
import React, { useMemo, useState } from "react";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";

interface ContentProps {
  veranstaltung: Veranstaltung;
}

export default function TeamContent({ veranstaltung }: ContentProps) {
  const [veranstaltungForStaff, setVeranstaltungForStaff] = useState<Veranstaltung>(veranstaltung);
  function staffUpdated(veranst: Veranstaltung) {
    setVeranstaltungForStaff(veranst);
  }

  const activeRows = useMemo(() => {
    const staff = veranstaltung.staff;
    const rows: { title: string; sectionName: StaffType }[] = [];
    if (!staff.modNotNeeded) {
      rows.push({
        title: "Master",
        sectionName: "mod",
      });
    }
    if (!staff.kasseVNotNeeded) {
      rows.push({
        title: "Kasse (Verantwortlich)",
        sectionName: "kasseV",
      });
    }
    if (!staff.kasseNotNeeded) {
      rows.push({
        title: "Kasse (Unterstützung)",
        sectionName: "kasse",
      });
    }
    if (!staff.technikerVNotNeeded) {
      rows.push({
        title: "Ton",
        sectionName: "technikerV",
      });
    }
    if (!staff.technikerNotNeeded) {
      rows.push({
        title: "Licht",
        sectionName: "techniker",
      });
    }
    if (!staff.merchandiseNotNeeded) {
      rows.push({
        title: "Merchandise",
        sectionName: "merchandise",
      });
    }
    return rows;
  }, [veranstaltung.staff]);

  return veranstaltung.staff.noStaffNeeded ? (
    <p>Niemand benötigt.</p>
  ) : (
    <List
      dataSource={activeRows}
      renderItem={(item) => (
        <List.Item
          extra={<ActionButton veranstaltung={veranstaltungForStaff} sectionName={item.sectionName} staffUpdated={staffUpdated} />}
        >
          <List.Item.Meta
            title={item.title}
            description={<ActiveUsers sectionName={item.sectionName} veranstaltung={veranstaltungForStaff} />}
          />
        </List.Item>
      )}
    />
  );
}
