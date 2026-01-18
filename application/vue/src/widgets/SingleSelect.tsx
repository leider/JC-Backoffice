import { Form, Select } from "antd";
import React, { useCallback, useMemo } from "react";
import { NamePath } from "antd/es/form/interface";
import map from "lodash/map";
import { useFormItemInTableStyle } from "@/widgets/EditableTable/useFormItemInTableStyle.ts";

interface SingleSelectParams {
  readonly name: NamePath;
  readonly label?: string;
  readonly options: string[];
  readonly onChange?: (val: string) => void;
  readonly initialValue?: string;
  readonly required?: boolean;
  readonly useInTable?: boolean;
}

export type LabelAndValue = { label: string; value: string };

function InnerSelect({
  options,
  onChange,
  onSelect,
  allowClear,
  useInTable,
  value,
}: {
  readonly options: string[];
  readonly value?: string;
  readonly onChange?: (val: string) => void;
  readonly onSelect?: (val: string) => void;
  readonly allowClear?: boolean;
  readonly useInTable?: boolean;
}) {
  const style = useFormItemInTableStyle(useInTable);
  const realOptions = useMemo(() => map(options, (opt) => ({ label: opt, value: opt })), [options]);
  const onChangeHandler = useCallback(
    (val: string) => {
      onChange?.(val);
      onSelect?.(val);
    },
    [onChange, onSelect],
  );

  return (
    <Select
      allowClear={allowClear}
      onChange={onChangeHandler}
      options={realOptions}
      showSearch
      style={{ ...style, width: "100%" }}
      value={value}
    />
  );
}

export default function SingleSelect({ label, name, onChange, options, initialValue, required, useInTable }: SingleSelectParams) {
  return (
    <Form.Item
      colon={false}
      initialValue={initialValue}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : undefined}
      name={name}
      noStyle={useInTable}
      rules={[{ required: required }]}
      style={label ? {} : { marginBottom: 0 }}
      validateTrigger="onSelect"
    >
      <InnerSelect allowClear={!required} onChange={onChange} options={options} useInTable={useInTable} />
    </Form.Item>
  );
}
