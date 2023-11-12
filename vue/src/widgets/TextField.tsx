import { Form as AntdForm, Input } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { Rule } from "antd/es/form";

type TTextField = {
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
   * Whether the value should be clearable when disabled.
   * @type {boolean}
   */
  clearOnDisabled?: boolean;

  /**
   * The inital value.
   * @type {T}
   */
  initialValue?: string;

  /**
   * An optional tooltip value.
   * @type {string}
   */
  tooltip?: string;

  /**
   * Callback when the input value has changed.
   */
  onChange?: (value: string | null) => void;

  /**
   * An optional help string.
   * @type {string}
   */
  help?: string;

  /**
   * Indicates that the input must be a valid E-Mail
   * @type {boolean}
   */
  isEmail?: boolean;

  /**
   * Callback function to generate a unique value.
   * @type {Rule}
   */
  uniqueValuesValidator?: Rule;
};

/**
 * @param {TTextField} props
 * @return {*}  {JSX.Element}
 */
export const TextField: FunctionComponent<TTextField> = (props: TTextField): JSX.Element => {
  const [rules, setRules] = useState<Rule[] | undefined>(undefined);
  useEffect(() => {
    const rulesToSet: Rule[] = [];
    if (props.required) {
      rulesToSet.push({
        required: true,
      });
    }
    if (props.uniqueValuesValidator) {
      rulesToSet.push(props.uniqueValuesValidator);
    }
    if (props.isEmail) {
      rulesToSet.push({
        type: "email",
        message: "Die Eingabe ist keine gültige E-Mail Adresse",
      });
    }
    setRules(rulesToSet);
  }, [props.required, props.isEmail, props.uniqueValuesValidator]);

  return (
    <AntdForm.Item
      name={props.name}
      label={props.label ? <b>{props.label}:</b> : ""}
      rules={rules}
      style={props.label ? {} : { marginBottom: 0 }}
      initialValue={props.initialValue}
      valuePropName={"textVal"}
      trigger={"onText"}
      tooltip={props.tooltip}
      help={props.help}
    >
      <TextInputEmbedded disabled={props.disabled} clearOnDisabled={props.clearOnDisabled && props.disabled} onChange={props.onChange} />
    </AntdForm.Item>
  );
};

type TTextInputEmbedded = {
  disabled?: boolean;
  clearOnDisabled?: boolean;
  textVal?: string;
  onText?: (value: string | null) => void;
  id?: string;
  onChange?: (value: string | null) => void;
};

const TextInputEmbedded: FunctionComponent<TTextInputEmbedded> = (props: TTextInputEmbedded) => {
  const [value, setValue] = useState<string | undefined>("");

  useEffect(
    () => {
      setValue(!(props.clearOnDisabled && props.disabled) ? props.textVal || "" : "");
      props.onText?.(!(props.clearOnDisabled && props.disabled) ? props.textVal || "" : "");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.textVal, props.clearOnDisabled, props.disabled, props.onText],
  );

  return (
    <Input
      id={props.id}
      disabled={props.disabled}
      value={value}
      onChange={({ target: { value: nextValue } }) => {
        setValue(nextValue);
        props.onText!(nextValue);
        props.onChange?.(nextValue);
      }}
      onBlur={({ target: { value: nextValue } }) => {
        const trimmedValue = nextValue.trim() ? nextValue.trim() : null;
        props.onText!(trimmedValue);
        props.onChange?.(trimmedValue);
      }}
    />
  );
};
