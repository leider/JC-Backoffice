import { Form, Select } from "antd";
import React, { useEffect, useMemo, useRef } from "react";
import { RefSelectProps } from "antd/es/select";
import { NamePath } from "rc-field-form/es/interface";
import map from "lodash/map";

interface SingleSelectParams {
  readonly name: NamePath;
  readonly label?: string;
  readonly options: string[];
  readonly onChange?: (val: string) => void;
  readonly initialValue?: string;
  readonly required?: boolean;
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
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
  readonly options: string[];
  readonly value?: string;
  readonly onChange?: (val: string) => void;
  readonly onSelect?: (val: string) => void;
  readonly allowClear?: boolean;
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
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
