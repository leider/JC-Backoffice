import { Form, Space } from "antd";
import React from "react";
import InverseCheckbox from "@/widgets/InverseCheckbox.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import { MitarbeiterRowProps } from "@/components/veranstaltung/allgemeines/MitarbeiterCard.tsx";
import MitarbeiterMultiSelect, { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";

const StaffRow: React.FC<MitarbeiterRowProps> = ({ usersAsOptions, sectionName, label }) => {
  return (
    <Form.Item label={<b>{label}:</b>} style={{ marginBottom: 12 }}>
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
}: {
  forVermietung: boolean;
  usersAsOptions: UserWithKann[];
  brauchtTechnik: boolean;
}) {
  return (
    <>
      <StaffRow label="Abendverantwortlicher" usersAsOptions={usersAsOptions} sectionName="mod" />
      {!forVermietung && (
        <>
          <StaffRow usersAsOptions={usersAsOptions} label="Kasse (Verantwortlich)" sectionName="kasseV" />
          <StaffRow usersAsOptions={usersAsOptions} label="Kasse (Unterstützung)" sectionName="kasse" />
        </>
      )}
      {(!forVermietung || brauchtTechnik) && (
        <>
          <StaffRow usersAsOptions={usersAsOptions} label="Ton" sectionName="technikerV" />
          <StaffRow usersAsOptions={usersAsOptions} label="Licht" sectionName="techniker" />
        </>
      )}
      {!forVermietung && <StaffRow label="Merchandise" usersAsOptions={usersAsOptions} sectionName="merchandise" />}
      <StaffRow usersAsOptions={usersAsOptions} label="Ersthelfer (als Gast)" sectionName="ersthelfer" />
    </>
  );
}
