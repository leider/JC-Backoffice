import Collapsible from "@/widgets/Collapsible.tsx";
import { Col, List, Row } from "antd";
import React from "react";
import Staff, { StaffType } from "jc-shared/konzert/staff.ts";
import User from "jc-shared/user/user.ts";
import Konzert from "../../../../../shared/konzert/konzert.ts";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

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
export default function StaffInPreview({ konzert }: { konzert: Konzert }) {
  const { allUsers } = useJazzContext();
  return (
    <Collapsible suffix="staff" label="Staff">
      <Row gutter={12}>
        <Col span={24}>
          <StaffList
            header="Master"
            staff={konzert.staff}
            parts={{ verant: "mod" }}
            notNeeded={konzert.staff.modNotNeeded}
            theUsers={allUsers}
          />
          <StaffList
            header="Kasse"
            staff={konzert.staff}
            parts={{ verant: "kasseV", normal: "kasse" }}
            notNeeded={konzert.staff.kasseNotNeeded && konzert.staff.kasseVNotNeeded}
            theUsers={allUsers}
          />
          <StaffList
            header="Technik"
            staff={konzert.staff}
            parts={{ verant: "technikerV", normal: "techniker" }}
            notNeeded={konzert.staff.technikerNotNeeded && konzert.staff.technikerVNotNeeded}
            theUsers={allUsers}
          />
          <StaffList
            header="Merchandise"
            staff={konzert.staff}
            parts={{ normal: "merchandise" }}
            notNeeded={konzert.staff.merchandiseNotNeeded}
            theUsers={allUsers}
          />
        </Col>
      </Row>
    </Collapsible>
  );
}
