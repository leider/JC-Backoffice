import { List, theme } from "antd";
import { ActiveUsers, AddRemoveStaffButton } from "@/components/team/TeamBlock/TeamStaffRow.tsx";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import CheckSquareTwoTone from "@ant-design/icons/lib/icons/CheckSquareTwoTone";
import { WarningTwoTone } from "@ant-design/icons";
import { TeamContext } from "@/components/team/TeamContext.ts";
import intersection from "lodash/intersection";

interface ContentProps {
  readonly veranstaltung: Veranstaltung;
}

export default function TeamContent({ veranstaltung }: ContentProps) {
  const { alleErsthelfer } = useContext(TeamContext);
  const [veranstaltungForStaff, setVeranstaltungForStaff] = useState<Veranstaltung>(veranstaltung);
  const staffUpdated = useCallback((veranst: Veranstaltung) => setVeranstaltungForStaff(veranst), []);
  const { useToken } = theme;
  const token = useToken().token;

  const activeRows = useMemo(() => {
    const staff = veranstaltung.staff;
    const rows: { title: string; sectionName: StaffType; empty: boolean }[] = [];
    const hatErsthelfer = intersection(staff.allNames, alleErsthelfer).length;
    if (!staff.modNotNeeded) {
      rows.push({
        title: "Abendverantwortlicher",
        sectionName: "mod",
        empty: !staff.mod.length,
      });
    }
    if (!staff.kasseVNotNeeded) {
      rows.push({
        title: "Kasse (Verantwortlich)",
        sectionName: "kasseV",
        empty: !staff.kasseV.length,
      });
    }
    if (!staff.kasseNotNeeded) {
      rows.push({
        title: "Kasse (Unterstützung)",
        sectionName: "kasse",
        empty: !staff.kasse.length,
      });
    }
    if (!staff.technikerVNotNeeded) {
      rows.push({
        title: "Ton",
        sectionName: "technikerV",
        empty: !staff.technikerV.length,
      });
    }
    if (!staff.technikerNotNeeded) {
      rows.push({
        title: "Licht",
        sectionName: "techniker",
        empty: !staff.techniker.length,
      });
    }
    if (!staff.merchandiseNotNeeded) {
      rows.push({
        title: "Merchandise",
        sectionName: "merchandise",
        empty: !staff.merchandise.length,
      });
    }
    if (!staff.ersthelferNotNeeded) {
      rows.push({ title: "Ersthelfer (als Gast)", sectionName: "ersthelfer", empty: !hatErsthelfer });
    }
    return rows;
  }, [alleErsthelfer, veranstaltung.staff]);

  const renderItem = useCallback(
    (item: { title: string; sectionName: StaffType; empty: boolean }) => (
      <List.Item
        extra={<AddRemoveStaffButton sectionName={item.sectionName} staffUpdated={staffUpdated} veranstaltung={veranstaltungForStaff} />}
      >
        <List.Item.Meta
          avatar={
            item.empty ? (
              <WarningTwoTone style={{ fontSize: 16 }} twoToneColor={token.colorError} />
            ) : (
              <CheckSquareTwoTone style={{ fontSize: 16 }} twoToneColor={token.colorSuccess} />
            )
          }
          description={<ActiveUsers sectionName={item.sectionName} veranstaltung={veranstaltungForStaff} />}
          title={item.title}
        />
      </List.Item>
    ),
    [staffUpdated, token.colorError, token.colorSuccess, veranstaltungForStaff],
  );

  return veranstaltung.staff.noStaffNeeded ? <p>Niemand benötigt.</p> : <List dataSource={activeRows} renderItem={renderItem} />;
}
