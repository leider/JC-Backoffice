import { Form, Space } from "antd";
import React, { useContext } from "react";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import InverseCheckbox from "@/widgets/InverseCheckbox.tsx";
import { DynamicItem } from "@/widgets/DynamicItem.tsx";
import UserMultiSelect from "@/components/team/UserMultiSelect.tsx";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";

interface AdminStaffRowProps {
  sectionName: StaffType;
  label?: string;
}

const AdminStaffRow: React.FC<AdminStaffRowProps> = ({ sectionName, label }: AdminStaffRowProps) => {
  const teamContext = useContext(TeamContext);
  const usersAsOptions = teamContext!.usersAsOptions;

  return (
    <Form.Item label={label} style={{ marginBottom: 12 }}>
      <Space.Compact block>
        <DynamicItem
          nameOfDepending={["staff", `${sectionName}NotNeeded`]}
          renderWidget={(getFieldValue) => {
            const notNeeded = getFieldValue(["staff", `${sectionName}NotNeeded`]);
            return <UserMultiSelect name={["staff", sectionName]} usersAsOptions={usersAsOptions} disabled={notNeeded} />;
          }}
        />
        <Form.Item name={["staff", `${sectionName}NotNeeded`]} valuePropName="checked" noStyle>
          <InverseCheckbox style={{ marginLeft: "5px", marginTop: "5px" }} />
        </Form.Item>{" "}
      </Space.Compact>
    </Form.Item>
  );
};

export default AdminStaffRow;
