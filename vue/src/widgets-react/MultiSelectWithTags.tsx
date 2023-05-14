import { Form, Select } from "antd";
import React, { CSSProperties, useEffect, useState } from "react";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";

export default function MultiSelectWithTags(props: {
  name: string[];
  label: string;
  options: string[];
  style?: CSSProperties;
  noAdd?: boolean;
  onChange?: () => void;
  specialTagRender?: (props: CustomTagProps) => JSX.Element;
}) {
  const [realOptions, setRealOptions] = useState<{ label: string; value: string }[]>([]);
  useEffect(() => {
    if (!props.options) {
      return;
    }
    setRealOptions(props.options.map((opt) => ({ label: opt, value: opt })));
  }, [props.options]);

  return (
    <Form.Item label={<b>{props.label}:</b>} name={props.name} style={props.style}>
      <Select options={realOptions} mode={props.noAdd ? "multiple" : "tags"} onChange={props.onChange} tagRender={props.specialTagRender} />
    </Form.Item>
  );
}
