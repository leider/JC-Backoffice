import { Form, Select, Tag, Tooltip } from "antd";
import React, { CSSProperties } from "react";
import { CustomTagProps } from "rc-select/lib/BaseSelect";

export type UsersAsOption = { label: string; value: string };
export default function UserMultiSelect(props: {
  name: string[] | string;
  usersAsOptions: UsersAsOption[];
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const tagRender = (props: CustomTagProps) => {
    // eslint-disable-next-line react/prop-types
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
    <Form.Item name={props.name} noStyle>
      <Select mode="multiple" options={props.usersAsOptions} disabled={props.disabled} tagRender={tagRender} style={props.style} />
    </Form.Item>
  );
}
