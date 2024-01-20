import { Form, Select } from "antd";
import React from "react";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

function InnerSelect({
  usersAsOptions,
  disabled,
  onChange,
  value,
}: {
  usersAsOptions: LabelAndValue[];
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  value?: string[];
}) {
  const filtered = usersAsOptions.filter((u) => !value?.includes(u.value));

  return <Select mode="multiple" options={filtered} disabled={disabled} style={{ width: "100%" }} onChange={onChange} />;
}

export default function UserMultiSelect({
  name,
  usersAsOptions,
  disabled,
  label,
}: {
  name: string[] | string;
  usersAsOptions: LabelAndValue[];
  disabled?: boolean;
  label?: string;
}) {
  return (
    <Form.Item label={label ? <b>{label}:</b> : undefined} name={name} noStyle={!label}>
      <InnerSelect disabled={disabled} usersAsOptions={usersAsOptions} />
    </Form.Item>
  );
}
