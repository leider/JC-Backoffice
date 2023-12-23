import { Form, Select } from "antd";
import React, { CSSProperties, useMemo } from "react";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";

export default function MultiSelectWithTags({
  name,
  label,
  options,
  style,
  noAdd,
  onChange,
  specialTagRender,
}: {
  name: string[] | string;
  label: string;
  options: string[];
  style?: CSSProperties;
  noAdd?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;
  specialTagRender?: (props: CustomTagProps) => React.ReactElement;
}) {
  const realOptions = useMemo(() => {
    return options.map((opt) => ({ label: opt, value: opt }));
  }, [options]);

  return (
    <Form.Item label={<b>{label}:</b>} name={name} style={style}>
      <Select options={realOptions} mode={noAdd ? "multiple" : "tags"} onChange={onChange} tagRender={specialTagRender} />
    </Form.Item>
  );
}
