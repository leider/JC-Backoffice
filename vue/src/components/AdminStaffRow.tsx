import { Form, Select, Space } from "antd";
import React from "react";
import { StaffType } from "jc-shared/veranstaltung/staff";
import InverseCheckbox from "@/widgets-react/InverseCheckbox";

interface AdminStaffRowProps {
  sectionName: StaffType;
  label: string;
  usersAsOptions: { label: string; value: string }[];
}

const AdminStaffRow: React.FC<AdminStaffRowProps> = ({ usersAsOptions, sectionName, label }: AdminStaffRowProps) => {
  return (
    <Form.Item label={label}>
      <Space.Compact block>
        <Form.Item label={label} name={["staff", sectionName]} noStyle>
          <Select mode="multiple" options={usersAsOptions} style={{ width: "90%" }} />
        </Form.Item>
        <Form.Item name={["staff", `${sectionName}NotNeeded`]} valuePropName="checked" noStyle>
          <InverseCheckbox style={{ marginLeft: "5px", marginTop: "5px" }} />
        </Form.Item>
      </Space.Compact>
    </Form.Item>
  );
};

export default AdminStaffRow;
