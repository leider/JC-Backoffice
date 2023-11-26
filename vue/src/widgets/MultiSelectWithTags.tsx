import { Form, Select } from "antd";
import React, { CSSProperties, useEffect, useState } from "react";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

export default function MultiSelectWithTags(props: {
  name: string[] | string;
  label: string;
  options: string[];
  style?: CSSProperties;
  noAdd?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (value: any) => void;
  specialTagRender?: (props: CustomTagProps) => JSX.Element;
}) {
  const [realOptions, setRealOptions] = useState<LabelAndValue[]>([]);
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
