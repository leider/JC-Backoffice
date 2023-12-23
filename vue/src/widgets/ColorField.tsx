import { ColorPicker, Form as AntdForm } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { Rule } from "antd/es/form";

type TColorField = {
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
   * The inital value.
   * @type {T}
   */
  initialValue?: string;
};

/**
 * @param {TColorField} props
 * @return {*}  {React.ReactElement}
 */
export const ColorField: FunctionComponent<TColorField> = ({ name, label, required, initialValue }: TColorField): React.ReactElement => {
  const [rules, setRules] = useState<Rule[] | undefined>(undefined);
  useEffect(() => {
    const rulesToSet: Rule[] = [];
    if (required) {
      rulesToSet.push({
        required: true,
      });
    }
    setRules(rulesToSet);
  }, [required]);

  return (
    <AntdForm.Item
      name={name}
      label={label ? <b>{label}:</b> : ""}
      rules={rules}
      style={label ? {} : { marginBottom: 0 }}
      initialValue={initialValue}
      valuePropName={"colorVal"}
      trigger={"onColor"}
    >
      <ColorInputEmbedded />
    </AntdForm.Item>
  );
};

type TColorInputEmbedded = {
  colorVal?: string;
  onColor?: (value: string) => void;
};

const ColorInputEmbedded: FunctionComponent<TColorInputEmbedded> = ({ colorVal, onColor }: TColorInputEmbedded) => {
  return <ColorPicker format="hex" value={colorVal} onChange={(value, hex) => onColor?.(hex)} />;
};
