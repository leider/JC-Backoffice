import { Form } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";

import NumericInputEmbedded from "./NumericInputEmbedded";
import { Rule } from "antd/es/form";

type NumberInputProps = {
  /**
   * The name of the input.
   * @type {(string | string[])}
   */
  name: string | string[];

  /**
   * The label of the input.
   * @type {string}
   */
  label?: string;

  /**
   * Whether the input value is required.
   * @type {boolean}
   */
  required?: boolean;

  /**
   * Whether the input is disabled.
   * @type {boolean}
   */
  disabled?: boolean;

  /**
   * The inital value.
   * @type {T}
   */
  initialValue?: number;

  /**
   * Callback when the input value has vhanged.
   */
  onChange?: (value: number | null) => void;

  decimals: number;

  /**
   * The lower limit.
   * @type {number}
   */
  min?: number;

  /**
   * The upper limit.
   * @type {number}
   */
  max?: number;

  /**
   * A boolean to tell if we want the lower limit to be exclusive.
   * @type {boolean}
   */
  exclusiveMin?: boolean;

  /**
   * A boolean to tell if we want the upper limit to be exclusive.
   * @type {boolean}
   */
  exclusiveMax?: boolean;
  suffix?: ReactNode;
};

/**
 * A widget for numeric values.
 *
 * You can set upper and lower limts to it, and tell if they should be inclusive or exclusive.
 * @param {NumberInputProps} props
 * @return {*}  {React.ReactElement}
 */
export const NumberInput: FC<NumberInputProps> = ({
  decimals,
  required,
  suffix,
  label,
  max,
  exclusiveMax,
  min,
  exclusiveMin,
  name,
  onChange,
  initialValue,
  disabled,
}: NumberInputProps): React.ReactElement => {
  const [rules, setRules] = useState<Rule[] | undefined>(undefined);

  useEffect(() => {
    setRules([{ required: required }]);
  }, [required]);

  return (
    <Form.Item
      name={name}
      label={label ? <b>{label}:</b> : undefined}
      rules={rules}
      valuePropName="number"
      trigger="onNumber"
      style={label ? {} : { marginBottom: 0 }}
      initialValue={initialValue}
    >
      <NumericInputEmbedded
        decimals={decimals}
        disabled={disabled}
        min={min}
        exclusiveMin={exclusiveMin}
        exclusiveMax={exclusiveMax}
        max={max}
        onChange={onChange}
        suffix={suffix}
      />
    </Form.Item>
  );
};

interface NumberInputWithDirectValueParams {
  value: number;
  decimals: number;
  suffix?: string;
  label?: string;
}

export const NumberInputWithDirectValue: FC<NumberInputWithDirectValueParams> = ({
  decimals,
  suffix,
  value,
  label,
}: NumberInputWithDirectValueParams): React.ReactElement => {
  return (
    <Form.Item label={label && <b>{label}:</b>} noStyle={!label}>
      <NumericInputEmbedded decimals={decimals} suffix={suffix} number={value} disabled />
    </Form.Item>
  );
};
