import { Form, Select } from "antd";
import React, { useEffect, useMemo, useRef } from "react";
import { RefSelectProps } from "antd/es/select";
import { NamePath } from "rc-field-form/es/interface";
import map from "lodash/map";

interface SingleSelectParams {
  name: NamePath;
  label?: string;
  options: string[];
  onChange?: (val: string) => void;
  initialValue?: string;
  required?: boolean;
  save?: (keepEditing?: boolean) => void;
  focus?: boolean;
}

export type LabelAndValue = { label: string; value: string };

function InnerSelect({
  options,
  onChange,
  onSelect,
  allowClear,
  save,
  focus,
  value,
}: {
  options: string[];
  value?: string;
  onChange?: (val: string) => void;
  onSelect?: (val: string) => void;
  allowClear?: boolean;
  save?: (keepEditing?: boolean) => void;
  focus?: boolean;
}) {
  const realOptions = useMemo(() => map(options, (opt) => ({ label: opt, value: opt })), [options]);
  const ref = useRef<RefSelectProps>(null);
  useEffect(() => {
    if (focus && options) {
      ref.current?.focus();
    }
  }, [focus, options]);

  return (
    <Select
      allowClear={allowClear}
      onBlur={() => save?.()}
      onChange={(val) => {
        onChange?.(val);
        onSelect?.(val);
        save?.(true);
      }}
      options={realOptions}
      showSearch
      value={value}
    />
  );
}

export default function SingleSelect({ label, name, onChange, options, initialValue, required, save, focus }: SingleSelectParams) {
  return (
    <Form.Item
      colon={false}
      initialValue={initialValue}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : undefined}
      name={name}
      rules={[{ required: required }]}
      style={label ? {} : { marginBottom: 0 }}
      validateTrigger="onSelect"
    >
      <InnerSelect allowClear={!required} focus={focus} onChange={onChange} options={options} save={save} />
    </Form.Item>
  );
}
