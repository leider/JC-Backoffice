import { Checkbox, Form, Input, Select } from "antd";
import React from "react";
import { StaffType } from "jc-shared/veranstaltung/staff";

interface AdminStaffRowProps {
  sectionName: StaffType;
  label: string;
  usersAsOptions: { label: string; value: string }[];
}

const AdminStaffRow: React.FC<AdminStaffRowProps> = ({ usersAsOptions, sectionName, label }: AdminStaffRowProps) => {
  return (
    <Form.Item label={label}>
      <Input.Group>
        <Form.Item label={label} name={["staff", sectionName]} noStyle>
          <Select mode="multiple" options={usersAsOptions} style={{ width: "80%" }} />
        </Form.Item>
        <Form.Item name={["staff", sectionName + "NotNeeded"]} valuePropName="checked" noStyle>
          <Checkbox style={{ marginLeft: "5px" }} />
        </Form.Item>
      </Input.Group>
    </Form.Item>
  );
};

export default AdminStaffRow;
