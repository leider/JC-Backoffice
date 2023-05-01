import { Form } from "antd";
import { FunctionComponent, ReactNode, React, useEffect, useState } from "react";

import NumericInputEmbedded from "./NumericInputEmbedded";

export type CommonWidgetProps<T> = {
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
  initialValue?: T;

  /**
   * An optional tooltip value.
   * @type {string}
   */
  tooltip?: string;

  /**
   * Callback when the input value has vhanged.
   */
  onChange?: (value: any) => void;

  /**
   * An optional help string.
   * @type {string}
   */
  help?: string;
};

type NumberInputProps = CommonWidgetProps<number> & {
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
  suffix: ReactNode;
};

/**
 * A widget for numeric values.
 *
 * You can set upper and lower limts to it, and tell if they should be inclusive or exclusive.
 * @param {NumberInputProps} props
 * @return {*}  {JSX.Element}
 */
export const NumberInput: FunctionComponent<NumberInputProps> = (props: NumberInputProps): JSX.Element => {
  const [rules, setRules] = useState<any[] | undefined>(undefined);

  useEffect(() => {
    setRules([{ required: props.required }]);
  }, [props.required]);

  return (
    <Form.Item
      name={props.name}
      label={props.label ? <b>{props.label}:</b> : undefined}
      rules={rules}
      valuePropName="number"
      trigger="onNumber"
      style={props.label ? {} : { marginBottom: 0 }}
      initialValue={props.initialValue}
      tooltip={props.tooltip}
    >
      <NumericInputEmbedded
        decimals={props.decimals}
        disabled={props.disabled}
        min={props.min}
        exclusiveMin={props.exclusiveMin}
        exclusiveMax={props.exclusiveMax}
        max={props.max}
        onChange={props.onChange}
        suffix={props.suffix}
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

export const NumberInputWithDirectValue: FunctionComponent<NumberInputWithDirectValueParams> = ({
  decimals,
  suffix,
  value,
  label,
}: NumberInputWithDirectValueParams): JSX.Element => {
  return (
    <Form.Item label={label && <b>{label}:</b>} noStyle={!label}>
      <NumericInputEmbedded decimals={decimals} suffix={suffix} number={value} disabled />
    </Form.Item>
  );
};
