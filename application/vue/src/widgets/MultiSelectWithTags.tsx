import { Form, Select } from "antd";
import React, { CSSProperties, useMemo } from "react";
import type { CustomTagProps } from "rc-select/lib/BaseSelect";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import map from "lodash/map";
import filter from "lodash/filter";

function InnerSelect({
  id,
  realOptions,
  noAdd,
  onChange,
  specialTagRender,
  value,
}: {
  id?: string;
  realOptions: LabelAndValue[];
  noAdd?: boolean;
  onChange?: (value: string[]) => void;
  value?: string[];
  specialTagRender?: (props: CustomTagProps) => React.ReactElement;
}) {
  const filtered = useMemo(
    () => (noAdd ? filter(realOptions, (u) => !value?.includes(u.value)) : realOptions),
    [noAdd, realOptions, value],
  );

  return (
    <Select
      id={id}
      mode={noAdd ? "multiple" : "tags"}
      onChange={onChange}
      options={filtered}
      style={{ width: "100%" }}
      tagRender={specialTagRender}
      value={value}
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
  const realOptions = useMemo(() => map(options, (opt) => ({ label: opt, value: opt })), [options]);

  return (
    <Form.Item label={<b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b>} name={name} style={style}>
      <InnerSelect noAdd={noAdd} realOptions={realOptions} specialTagRender={specialTagRender} />
    </Form.Item>
  );
}
