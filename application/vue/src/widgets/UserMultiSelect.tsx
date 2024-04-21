import { Form, Select } from "antd";
import React, { useMemo } from "react";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { useTagRenderForUser } from "@/widgets/useTagRenderForUser.tsx";

function InnerSelect({
  id,
  usersAsOptions,
  disabled,
  onChange,
  value,
}: {
  id?: string;
  usersAsOptions: LabelAndValue[];
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  value?: string[];
}) {
  const tagRender = useTagRenderForUser(usersAsOptions);
  const filtered = useMemo(() => usersAsOptions.filter((u) => !value?.includes(u.value)), [usersAsOptions, value]);

  return (
    <Select
      id={id}
      mode="multiple"
      options={filtered}
      disabled={disabled}
      style={{ width: "100%" }}
      tagRender={tagRender}
      onChange={onChange}
      value={value}
    />
  );
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
    <Form.Item label={label ? <b style={{ whiteSpace: "nowrap" }}>{label}:</b> : undefined} name={name} noStyle={!label}>
      <InnerSelect disabled={disabled} usersAsOptions={usersAsOptions} />
    </Form.Item>
  );
}
