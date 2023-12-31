import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung.tsx";
import { Col, List, Row } from "antd";
import React, { useEffect, useState } from "react";
import Staff, { StaffType } from "jc-shared/veranstaltung/staff.ts";
import User from "jc-shared/user/user.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useQuery } from "@tanstack/react-query";
import { allUsers } from "@/commons/loader.ts";
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
          {user.name} <a href={`tel:${user.tel}`}>{user.tel}</a> <a href={`mailto:${user.email}`}>{user.email}</a>
        </>
      );
    }
    return <List.Item>{item.bold ? <b>{renderUser(item.user)}</b> : <span>{renderUser(item.user)}</span>}</List.Item>;
  }

  return !notNeeded && <List size="small" header={<b>{header}:</b>} dataSource={names} renderItem={renderItem} />;
}
export default function StaffInPreview({ veranstaltung }: { veranstaltung: Veranstaltung }) {
  const [users, setUsers] = useState<User[]>([]);
  const theUsers = useQuery({ queryKey: ["users"], queryFn: allUsers });
  useEffect(() => {
    if (theUsers.data) {
      setUsers(theUsers.data);
    }
  }, [theUsers.data]);

  return (
    <CollapsibleForVeranstaltung suffix="staff" label="Staff">
      <Row gutter={12}>
        <Col span={24}>
          <StaffList
            header="Master"
            staff={veranstaltung.staff}
            parts={{ verant: "mod" }}
            notNeeded={veranstaltung.staff.modNotNeeded}
            theUsers={users}
          />
          <StaffList
            header="Kasse"
            staff={veranstaltung.staff}
            parts={{ verant: "kasseV", normal: "kasse" }}
            notNeeded={veranstaltung.staff.kasseNotNeeded && veranstaltung.staff.kasseVNotNeeded}
            theUsers={users}
          />
          <StaffList
            header="Technik"
            staff={veranstaltung.staff}
            parts={{ verant: "technikerV", normal: "techniker" }}
            notNeeded={veranstaltung.staff.technikerNotNeeded && veranstaltung.staff.technikerVNotNeeded}
            theUsers={users}
          />
          <StaffList
            header="Merchandise"
            staff={veranstaltung.staff}
            parts={{ normal: "merchandise" }}
            notNeeded={veranstaltung.staff.merchandiseNotNeeded}
            theUsers={users}
          />
        </Col>
      </Row>
    </CollapsibleForVeranstaltung>
  );
}
