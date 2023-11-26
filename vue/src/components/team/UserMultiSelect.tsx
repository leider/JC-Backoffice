import { Form, Select, Tag, Tooltip } from "antd";
import React, { CSSProperties } from "react";
import { CustomTagProps } from "rc-select/lib/BaseSelect";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

export default function UserMultiSelect(props: {
  name: string[] | string;
  usersAsOptions: LabelAndValue[];
  disabled?: boolean;
  style?: CSSProperties;
  label?: string;
  onChange?: (value: string[]) => void;
}) {
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

  return (
    <Form.Item label={props.label ? <b>{props.label}:</b> : undefined} name={props.name} noStyle={!props.label}>
      <Select
        mode="multiple"
        options={props.usersAsOptions}
        disabled={props.disabled}
        tagRender={tagRender}
        style={props.style}
        onChange={props.onChange}
      />
    </Form.Item>
  );
}
