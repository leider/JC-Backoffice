import { Form, Space } from "antd";
import React from "react";
import InverseCheckbox from "@/widgets/InverseCheckbox.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import MitarbeiterMultiSelect, { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";

export interface MitarbeiterRowProps {
  sectionName: StaffType;
  label?: string;
  usersAsOptions: UserWithKann[];
}

const StaffRow: React.FC<MitarbeiterRowProps> = ({ usersAsOptions, sectionName, label }) => {
  return (
    <Form.Item label={<b>{label + ":"}</b>}>
      <Space.Compact block>
        <DynamicItem
          nameOfDepending={["staff", `${sectionName}NotNeeded`]}
          renderWidget={(getFieldValue) => {
            const notNeeded = getFieldValue(["staff", `${sectionName}NotNeeded`]);
            return <MitarbeiterMultiSelect disabled={notNeeded} name={["staff", sectionName]} usersAsOptions={usersAsOptions} />;
          }}
        />
        <Form.Item name={["staff", `${sectionName}NotNeeded`]} noStyle valuePropName="checked">
          <InverseCheckbox style={{ marginLeft: "5px", marginTop: "5px" }} />
        </Form.Item>
      </Space.Compact>
    </Form.Item>
  );
};

export default function EditableStaffRows({
  forVermietung,
  usersAsOptions,
  brauchtTechnik,
}: {
  forVermietung: boolean;
  usersAsOptions: UserWithKann[];
  brauchtTechnik: boolean;
}) {
  return (
    <>
      <StaffRow label="Abendverantwortlicher" sectionName="mod" usersAsOptions={usersAsOptions} />
      {!forVermietung && (
        <>
          <StaffRow label="Kasse (Verantwortlich)" sectionName="kasseV" usersAsOptions={usersAsOptions} />
          <StaffRow label="Kasse (Unterstützung)" sectionName="kasse" usersAsOptions={usersAsOptions} />
        </>
      )}
      {(!forVermietung || brauchtTechnik) && (
        <>
          <StaffRow label="Ton" sectionName="technikerV" usersAsOptions={usersAsOptions} />
          <StaffRow label="Licht" sectionName="techniker" usersAsOptions={usersAsOptions} />
        </>
      )}
      {!forVermietung && <StaffRow label="Merchandise" sectionName="merchandise" usersAsOptions={usersAsOptions} />}
      <StaffRow label="Ersthelfer (als Gast)" sectionName="ersthelfer" usersAsOptions={usersAsOptions} />
    </>
  );
}
