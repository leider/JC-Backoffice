import { Form, Space } from "antd";
import React from "react";
import { StaffType } from "jc-shared/veranstaltung/staff";
import InverseCheckbox from "@/widgets/InverseCheckbox";
import { DynamicItem } from "@/widgets/DynamicItem";
import UserMultiSelect, { UsersAsOption } from "@/components/team/UserMultiSelect";

interface AdminStaffRowProps {
  sectionName: StaffType;
  label: string;
  usersAsOptions: UsersAsOption[];
}

const AdminStaffRow: React.FC<AdminStaffRowProps> = ({ usersAsOptions, sectionName, label }: AdminStaffRowProps) => {
  return (
    <Form.Item label={label} style={{ marginBottom: 12 }}>
      <Space.Compact block>
        <DynamicItem
          nameOfDepending={["staff", `${sectionName}NotNeeded`]}
          renderWidget={(getFieldValue) => {
            const notNeeded = getFieldValue(["staff", `${sectionName}NotNeeded`]);
            return (
              <UserMultiSelect
                name={["staff", sectionName]}
                usersAsOptions={usersAsOptions}
                disabled={notNeeded}
                style={{ width: "90%" }}
              />
            );
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
