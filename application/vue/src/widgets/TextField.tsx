import { Form as AntdForm, Input, InputRef } from "antd";
import { FunctionComponent, RefObject, useCallback, useEffect, useState } from "react";
import { Rule } from "antd/es/form";
import log from "eslint-plugin-react/lib/util/log";

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
   * Callback when the input value has changed.
   */
  onChange?: (value: string | null) => void;

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
  optionalRef?: RefObject<InputRef>;
  style?: any;
  inlineSave?: any;
};

/**
 * @param {TTextField} props
 * @return {*}  {React.ReactElement}
 */
export const TextField: FunctionComponent<TTextField> = ({
  required,
  uniqueValuesValidator,
  initialValue,
  isEmail,
  label,
  name,
  disabled,
  onChange,
  optionalRef,
  style,
  inlineSave,
}: TTextField): React.ReactElement => {
  const [rules, setRules] = useState<Rule[] | undefined>(undefined);
  useEffect(() => {
    const rulesToSet: Rule[] = [];
    if (required) {
      rulesToSet.push({
        required: true,
      });
    }
    if (uniqueValuesValidator) {
      rulesToSet.push(uniqueValuesValidator);
    }
    if (isEmail) {
      rulesToSet.push({
        type: "email",
        message: "Die Eingabe ist keine gültige E-Mail Adresse",
      });
    }
    setRules(rulesToSet);
  }, [required, isEmail, uniqueValuesValidator]);

  return (
    <AntdForm.Item
      name={name}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label}:</b> : ""}
      rules={rules}
      style={label ? { ...style } : { ...style, marginBottom: 0 }}
      initialValue={initialValue}
      valuePropName={"textVal"}
      trigger={"onText"}
    >
      <TextInputEmbedded disabled={disabled} onChange={onChange} optionalRef={optionalRef} inlineSave={inlineSave} />
    </AntdForm.Item>
  );
};

type TTextInputEmbedded = {
  id?: string;
  disabled?: boolean;
  textVal?: string;
  onText?: (value: string | null) => void;
  onChange?: (value: string | null) => void;
  optionalRef?: RefObject<InputRef>;
  inlineSave?: any;
};

const TextInputEmbedded: FunctionComponent<TTextInputEmbedded> = ({
  onText,
  textVal,
  disabled,
  onChange,
  id,
  optionalRef,
  inlineSave,
}: TTextInputEmbedded) => {
  const changed = useCallback(
    (text: string, trim?: boolean) => {
      const trimmedValue = trim ? text.trim() : text;
      onChange?.(trimmedValue);
      onText?.(trimmedValue);
    },
    [onChange, onText],
  );

  return (
    <Input
      id={id}
      autoComplete="off"
      disabled={disabled}
      value={textVal}
      onChange={({ target: { value: nextValue } }) => {
        changed(nextValue);
      }}
      onBlur={({ target: { value: nextValue } }) => {
        changed(nextValue, true);
        inlineSave?.(nextValue);
      }}
      ref={optionalRef}
      onPressEnter={inlineSave}
    />
  );
};
