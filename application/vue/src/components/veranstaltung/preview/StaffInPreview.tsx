import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, List, Row } from "antd";
import React, { useMemo } from "react";
import User from "jc-shared/user/user.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import Staff, { StaffType } from "jc-shared/veranstaltung/staff.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";
import { ErsthelferSymbol } from "@/widgets/ErsthelferSymbol.tsx";

function StaffList({
  header,
  notNeeded,
  parts,
  staff,
  theUsers,
}: {
  header: string;
  staff: Staff;
  notNeeded: boolean;
  parts: { verant?: StaffType; normal?: StaffType };
  theUsers: User[];
}) {
  function usersForNames(names: string[]) {
    return (theUsers || []).filter((user) => names.includes(user.id));
  }

  let names: { user: User; bold: boolean }[] = [];
  if (parts.verant) {
    names = names.concat(usersForNames(staff[parts.verant]).map((user) => ({ user, bold: true })));
  }
  if (parts.normal) {
    names = names.concat(usersForNames(staff[parts.normal]).map((user) => ({ user, bold: false })));
  }
  if (names.length === 0) {
    names.push({ user: new User({ name: "n.a." }), bold: false });
  }

  function renderItem(item: { user: User; bold: boolean }) {
    function renderUser(user: User) {
      return (
        <>
          {user.name}
          {user.kannErsthelfer && <ErsthelferSymbol />}
          &nbsp;
          <a href={`tel:${user.tel}`}>{user.tel}</a> <a href={`mailto:${user.email}`}>{user.email}</a>
        </>
      );
    }
    return <List.Item>{item.bold ? <b>{renderUser(item.user)}</b> : <span>{renderUser(item.user)}</span>}</List.Item>;
  }

  return !notNeeded && <List size="small" header={<b>{header}:</b>} dataSource={names} renderItem={renderItem} />;
}
export default function StaffInPreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const { allUsers } = useJazzContext();
  const getIn = useMemo(() => {
    const getIn = veranstaltung.artist.getInForMasterDate;
    return getIn ? DatumUhrzeit.forJSDate(getIn).uhrzeitKompakt : "nicht angegeben";
  }, [veranstaltung]);

  const transport = useMemo(() => veranstaltung.artist.bandTransport ?? "nicht angegeben", [veranstaltung]);

  return (
    <Collapsible suffix="staff" label="Staff">
      <Row gutter={12}>
        <Col span={24}>
          <b>Get In:</b> {getIn}, <b>Transport:</b> {transport}
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={24}>
          <StaffList
            header="Abendverantwortlicher"
            staff={veranstaltung.staff}
            parts={{ verant: "mod" }}
            notNeeded={veranstaltung.staff.modNotNeeded}
            theUsers={allUsers}
          />
          <StaffList
            header="Kasse"
            staff={veranstaltung.staff}
            parts={{ verant: "kasseV", normal: "kasse" }}
            notNeeded={veranstaltung.staff.kasseNotNeeded && veranstaltung.staff.kasseVNotNeeded}
            theUsers={allUsers}
          />
          <StaffList
            header="Technik"
            staff={veranstaltung.staff}
            parts={{ verant: "technikerV", normal: "techniker" }}
            notNeeded={veranstaltung.staff.technikerNotNeeded && veranstaltung.staff.technikerVNotNeeded}
            theUsers={allUsers}
          />
          <StaffList
            header="Merchandise"
            staff={veranstaltung.staff}
            parts={{ normal: "merchandise" }}
            notNeeded={veranstaltung.staff.merchandiseNotNeeded}
            theUsers={allUsers}
          />
        </Col>
      </Row>
    </Collapsible>
  );
}
