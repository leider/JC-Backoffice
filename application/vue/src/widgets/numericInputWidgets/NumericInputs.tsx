import { Form } from "antd";
import React, { FC, ReactNode, useEffect, useState } from "react";

import NumericInputEmbedded from "./NumericInputEmbedded";
import { Rule } from "antd/es/form";
import noop from "lodash/noop";

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
  save?: (keepEditing?: boolean) => void;
  focus?: boolean;
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
  save,
  focus,
}: NumberInputProps): React.ReactElement => {
  const [rules, setRules] = useState<Rule[] | undefined>(undefined);

  useEffect(() => {
    setRules([{ required: required }]);
  }, [required]);

  return (
    <Form.Item
      initialValue={initialValue}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : undefined}
      name={name}
      rules={rules}
      style={label ? {} : { marginBottom: 0 }}
      trigger="onNumber"
      valuePropName="number"
    >
      <NumericInputEmbedded
        decimals={decimals}
        disabled={disabled}
        exclusiveMax={exclusiveMax}
        exclusiveMin={exclusiveMin}
        focus={focus}
        max={max}
        min={min}
        onChange={onChange}
        save={save}
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
    <Form.Item label={label && <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b>} noStyle={!label}>
      <NumericInputEmbedded decimals={decimals} disabled number={value} onNumber={noop} suffix={suffix} />
    </Form.Item>
  );
};
