import { Form, Select } from "antd";
import React, { CSSProperties, useMemo } from "react";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

function InnerSelect({
  realOptions,
  noAdd,
  onChange,
  specialTagRender,
  value,
}: {
  realOptions: LabelAndValue[];
  noAdd?: boolean;
  onChange?: (value: string[]) => void;
  value?: string[];
  specialTagRender?: (props: CustomTagProps) => React.ReactElement;
}) {
  const filtered = useMemo(() => (noAdd ? realOptions.filter((u) => !value?.includes(u.value)) : realOptions), [noAdd, realOptions, value]);

  return (
    <Select
      options={filtered}
      mode={noAdd ? "multiple" : "tags"}
      value={value}
      onChange={onChange}
      tagRender={specialTagRender}
      style={{ width: "100%" }}
    />
  );
}

export default function MultiSelectWithTags({
  name,
  label,
  options,
  style,
  noAdd,
  specialTagRender,
}: {
  name: string[] | string;
  label: string;
  options: string[];
  style?: CSSProperties;
  noAdd?: boolean;
  specialTagRender?: (props: CustomTagProps) => React.ReactElement;
}) {
  const realOptions = useMemo(() => options.map((opt) => ({ label: opt, value: opt })), [options]);

  return (
    <Form.Item label={<b>{label}:</b>} name={name} style={style}>
      <InnerSelect realOptions={realOptions} noAdd={noAdd} specialTagRender={specialTagRender} />
    </Form.Item>
  );
}
