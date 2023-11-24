import React, { useEffect, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import { Col, Divider, Form, Row } from "antd";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useQuery } from "@tanstack/react-query";
import { allUsers } from "@/commons/loader.ts";
import UserMultiSelect from "@/components/team/UserMultiSelect.tsx";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import InverseCheckbox from "@/widgets/InverseCheckbox.tsx";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

interface MitarbeiterRowProps {
  sectionName: StaffType;
  label?: string;
  usersAsOptions: LabelAndValue[];
}

function MitarbeiterRow({ usersAsOptions, sectionName, label }: MitarbeiterRowProps) {
  return (
    <Row gutter={8}>
      <Col span={23}>
        <DynamicItem
          nameOfDepending={["staff", `${sectionName}NotNeeded`]}
          renderWidget={(getFieldValue) => {
            const notNeeded = getFieldValue(["staff", `${sectionName}NotNeeded`]);
            return (
              <UserMultiSelect
                label={label}
                name={["staff", sectionName]}
                usersAsOptions={usersAsOptions}
                disabled={notNeeded}
                style={{ width: "100%" }}
              />
            );
          }}
        />
      </Col>
      <Col span={1}>
        <Form.Item name={["staff", `${sectionName}NotNeeded`]} valuePropName="checked" label={label && " "}>
          <InverseCheckbox style={{ marginLeft: "5px", marginTop: "5px" }} />
        </Form.Item>{" "}
      </Col>
    </Row>
  );
}
export default function MitarbeiterCard({ forVermietung }: { forVermietung?: boolean }) {
  const { lg } = useBreakpoint();
  const dividerStyle = {
    marginTop: 0,
    marginBottom: 0,
    fontWeight: 600,
  };

  const userQuery = useQuery({ queryKey: ["users"], queryFn: allUsers });
  const [usersAsOptions, setUsersAsOptions] = useState<LabelAndValue[]>([]);
  useEffect(() => {
    if (userQuery.data) {
      setUsersAsOptions(userQuery.data.map((user) => ({ label: user.name, value: user.id })));
    }
  }, [userQuery.data]);

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Mitarbeiter" noTopBorder={lg}>
      <Divider orientation="left" orientationMargin={0} style={dividerStyle}>
        Master
      </Divider>
      <MitarbeiterRow usersAsOptions={usersAsOptions} sectionName="mod" />
      {!forVermietung && (
        <>
          <Divider orientation="left" orientationMargin={0} style={dividerStyle}>
            Kasse
          </Divider>
          <MitarbeiterRow usersAsOptions={usersAsOptions} label="Eins" sectionName="kasseV" />
          <MitarbeiterRow usersAsOptions={usersAsOptions} label="Zwei" sectionName="kasse" />
        </>
      )}
      <Divider orientation="left" orientationMargin={0} style={dividerStyle}>
        Techniker
      </Divider>
      <MitarbeiterRow usersAsOptions={usersAsOptions} label="Ton" sectionName="technikerV" />
      <MitarbeiterRow usersAsOptions={usersAsOptions} label="Licht" sectionName="techniker" />
      {!forVermietung && (
        <>
          <Divider orientation="left" orientationMargin={0} style={dividerStyle}>
            Merchandise
          </Divider>
          <MitarbeiterRow usersAsOptions={usersAsOptions} sectionName="merchandise" />
        </>
      )}
    </CollapsibleForVeranstaltung>
  );
}
