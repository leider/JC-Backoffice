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
  labelColor?: string;
}

const StaffRow: React.FC<MitarbeiterRowProps> = ({ usersAsOptions, sectionName, label, labelColor }) => {
  return (
    <Form.Item label={<b style={{ color: labelColor }}>{label}:</b>} style={{ marginBottom: 12 }}>
      <Space.Compact block>
        <DynamicItem
          nameOfDepending={["staff", `${sectionName}NotNeeded`]}
          renderWidget={(getFieldValue) => {
            const notNeeded = getFieldValue(["staff", `${sectionName}NotNeeded`]);
            return <MitarbeiterMultiSelect name={["staff", sectionName]} usersAsOptions={usersAsOptions} disabled={notNeeded} />;
          }}
        />
        <Form.Item name={["staff", `${sectionName}NotNeeded`]} valuePropName="checked" noStyle>
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
  labelColor,
}: {
  forVermietung: boolean;
  usersAsOptions: UserWithKann[];
  brauchtTechnik: boolean;
  labelColor?: string;
}) {
  return (
    <>
      <StaffRow label="Abendverantwortlicher" labelColor={labelColor} usersAsOptions={usersAsOptions} sectionName="mod" />
      {!forVermietung && (
        <>
          <StaffRow labelColor={labelColor} usersAsOptions={usersAsOptions} label="Kasse (Verantwortlich)" sectionName="kasseV" />
          <StaffRow labelColor={labelColor} usersAsOptions={usersAsOptions} label="Kasse (Unterstützung)" sectionName="kasse" />
        </>
      )}
      {(!forVermietung || brauchtTechnik) && (
        <>
          <StaffRow labelColor={labelColor} usersAsOptions={usersAsOptions} label="Ton" sectionName="technikerV" />
          <StaffRow labelColor={labelColor} usersAsOptions={usersAsOptions} label="Licht" sectionName="techniker" />
        </>
      )}
      {!forVermietung && <StaffRow label="Merchandise" labelColor={labelColor} usersAsOptions={usersAsOptions} sectionName="merchandise" />}
      <StaffRow labelColor={labelColor} usersAsOptions={usersAsOptions} label="Ersthelfer (als Gast)" sectionName="ersthelfer" />
    </>
  );
}
