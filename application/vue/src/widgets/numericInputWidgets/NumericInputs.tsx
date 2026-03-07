import { Form } from "antd";
import React, { ReactNode, useMemo } from "react";

import NumericInputEmbedded from "./NumericInputEmbedded";
import noop from "lodash/noop";

type NumberInputProps = {
  /**
   * The name of the input.
   * @type {(string | string[])}
   */
  readonly name: string | string[];

  /**
   * The label of the input.
   * @type {string}
   */
  readonly label?: string;

  /**
   * Whether the input value is required.
   * @type {boolean}
   */
  readonly required?: boolean;

  /**
   * Whether the input is disabled.
   * @type {boolean}
   */
  readonly disabled?: boolean;

  /**
   * The inital value.
   * @type {T}
   */
  readonly initialValue?: number;

  /**
   * Callback when the input value has vhanged.
   */
  readonly onChange?: (value: number | null) => void;

  readonly decimals: number;

  /**
   * The lower limit.
   * @type {number}
   */
  readonly min?: number;

  /**
   * The upper limit.
   * @type {number}
   */
  readonly max?: number;

  readonly suffix?: ReactNode;
  readonly useInTable?: boolean;
};

export function NumberInput({
  decimals,
  required,
  suffix,
  label,
  max,
  min,
  name,
  onChange,
  initialValue,
  disabled,
  useInTable,
}: NumberInputProps) {
  const rules = useMemo(() => {
    return [{ required: required }];
  }, [required]);

  return (
    <Form.Item
      initialValue={initialValue}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : undefined}
      name={name}
      noStyle={useInTable}
      rules={rules}
      style={label ? {} : { marginBottom: 0 }}
      trigger="onNumber"
      valuePropName="number"
    >
      <NumericInputEmbedded
        decimals={decimals}
        disabled={disabled}
        max={max}
        min={min}
        onChange={onChange}
        suffix={suffix}
        useInTable={useInTable}
      />
    </Form.Item>
  );
}

interface NumberInputWithDirectValueParams {
  readonly value: number;
  readonly decimals: number;
  readonly suffix?: string;
  readonly label?: string;
}

export function NumberInputWithDirectValue({ decimals, suffix, value, label }: NumberInputWithDirectValueParams) {
  return (
    <Form.Item label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : null} noStyle={!label}>
      <NumericInputEmbedded decimals={decimals} disabled number={value} onNumber={noop} suffix={suffix} />
    </Form.Item>
  );
}
