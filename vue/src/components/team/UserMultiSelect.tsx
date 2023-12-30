import { Form, Select, Tag, Tooltip } from "antd";
import React, { CSSProperties } from "react";
import { CustomTagProps } from "rc-select/lib/BaseSelect";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

export default function UserMultiSelect({
  name,
  usersAsOptions,
  disabled,
  style,
  label,
  onChange,
}: {
  name: string[] | string;
  usersAsOptions: LabelAndValue[];
  disabled?: boolean;
  style?: CSSProperties;
  label?: string;
  onChange?: (value: string[]) => void;
}) {
  const tagRender = ({ label, value, closable, onClose }: CustomTagProps) => {
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

  return (
    <Form.Item label={label ? <b>{label}:</b> : undefined} name={name} noStyle={!label}>
      <Select
        mode="multiple"
        options={usersAsOptions}
        disabled={disabled}
        tagRender={tagRender}
        style={{ ...style, width: "100%" }}
        onChange={onChange}
      />
    </Form.Item>
  );
}
