import { List } from "antd";
import { ActiveUsers, AddRemoveStaffButton } from "@/components/team/TeamBlock/TeamStaffRow.tsx";
import React, { useCallback, useMemo, useState } from "react";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

interface ContentProps {
  readonly veranstaltung: Veranstaltung;
}

export default function TeamContent({ veranstaltung }: ContentProps) {
  const [veranstaltungForStaff, setVeranstaltungForStaff] = useState<Veranstaltung>(veranstaltung);
  const staffUpdated = useCallback((veranst: Veranstaltung) => setVeranstaltungForStaff(veranst), []);

  const activeRows = useMemo(() => {
    const staff = veranstaltung.staff;
    const rows: { title: string; sectionName: StaffType }[] = [];
    if (!staff.modNotNeeded) {
      rows.push({
        title: "Abendverantwortlicher",
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
    if (!staff.ersthelferNotNeeded) {
      rows.push({ title: "Ersthelfer (als Gast)", sectionName: "ersthelfer" });
    }
    return rows;
  }, [veranstaltung.staff]);

  const renderItem = useCallback(
    (item: { title: string; sectionName: StaffType }) => (
      <List.Item
        extra={<AddRemoveStaffButton sectionName={item.sectionName} staffUpdated={staffUpdated} veranstaltung={veranstaltungForStaff} />}
      >
        <List.Item.Meta
          description={<ActiveUsers sectionName={item.sectionName} veranstaltung={veranstaltungForStaff} />}
          title={item.title}
        />
      </List.Item>
    ),
    [staffUpdated, veranstaltungForStaff],
  );

  return veranstaltung.staff.noStaffNeeded ? <p>Niemand benötigt.</p> : <List dataSource={activeRows} renderItem={renderItem} />;
}
