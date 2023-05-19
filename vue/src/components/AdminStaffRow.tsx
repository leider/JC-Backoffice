import { Form, Select, Space, Tag, Tooltip } from "antd";
import React from "react";
import { StaffType } from "jc-shared/veranstaltung/staff";
import InverseCheckbox from "@/widgets-react/InverseCheckbox";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import { DynamicItem } from "@/widgets-react/DynamicItem";
interface AdminStaffRowProps {
  sectionName: StaffType;
  label: string;
  usersAsOptions: { label: string; value: string }[];
}

const tagRender = (props: CustomTagProps) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose} style={{ marginRight: 3, paddingInline: 3 }}>
      <Tooltip title={label}>{value}</Tooltip>
    </Tag>
  );
};

const AdminStaffRow: React.FC<AdminStaffRowProps> = ({ usersAsOptions, sectionName, label }: AdminStaffRowProps) => {
  return (
    <Form.Item label={label} style={{ marginBottom: 12 }}>
      <Space.Compact block>
        <DynamicItem
          nameOfDepending={["staff", `${sectionName}NotNeeded`]}
          renderWidget={(getFieldValue) => {
            const notNeeded = getFieldValue(["staff", `${sectionName}NotNeeded`]);
            return (
              <Form.Item name={["staff", sectionName]} noStyle>
                <Select mode="multiple" options={usersAsOptions} disabled={notNeeded} tagRender={tagRender} style={{ width: "90%" }} />
              </Form.Item>
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
