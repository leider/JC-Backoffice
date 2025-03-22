import { Form as AntdForm, Input, InputRef } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { Rule } from "antd/es/form";

type TTextField = {
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
  readonly initialValue?: string;

  /**
   * Callback when the input value has changed.
   */
  readonly onChange?: (value: string | null) => void;

  /**
   * Indicates that the input must be a valid E-Mail
   * @type {boolean}
   */
  readonly isEmail?: boolean;

  /**
   * Callback function to generate a unique value.
   * @type {Rule}
   */
  readonly uniqueValuesValidator?: Rule;
  readonly style?: React.CSSProperties;
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
  readonly multiline?: boolean;
};

/**
 * @param {TTextField} props
 * @return {*}  {React.ReactElement}
 */
export function TextField({
  required,
  uniqueValuesValidator,
  initialValue,
  isEmail,
  label,
  name,
  disabled,
  onChange,
  style,
  save,
  focus,
  multiline,
}: TTextField): React.ReactElement {
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
      initialValue={initialValue}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : ""}
      name={name}
      rules={rules}
      style={label ? { ...style } : { ...style, marginBottom: 0 }}
      trigger="onText"
      valuePropName="textVal"
    >
      <TextInputEmbedded disabled={disabled} focus={focus} multiline={multiline} onChange={onChange} save={save} />
    </AntdForm.Item>
  );
}

type TTextInputEmbedded = {
  readonly id?: string;
  readonly disabled?: boolean;
  readonly textVal?: string;
  readonly onText?: (value: string | null) => void;
  readonly onChange?: (value: string | null) => void;
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
  readonly multiline?: boolean;
};

function TextInputEmbedded({ onText, textVal, disabled, onChange, id, save, focus, multiline }: TTextInputEmbedded) {
  const changed = useCallback(
    (text: string, trim?: boolean) => {
      const trimmedValue = trim ? text.trim() : text;
      onChange?.(trimmedValue);
      onText?.(trimmedValue);
    },
    [onChange, onText],
  );
  const inputRef = useRef<InputRef>(null);
  useEffect(() => {
    if (focus) {
      inputRef.current?.focus();
    }
  }, [focus]);

  return multiline ? (
    <Input.TextArea
      autoComplete="off"
      autoSize
      disabled={disabled}
      id={id}
      onBlur={({ target: { value: nextValue } }) => {
        changed(nextValue, true);
        save?.();
      }}
      onChange={({ target: { value: nextValue } }) => {
        changed(nextValue);
      }}
      onPressEnter={() => save?.()}
      ref={inputRef}
      value={textVal}
    />
  ) : (
    <Input
      autoComplete="off"
      disabled={disabled}
      id={id}
      onBlur={({ target: { value: nextValue } }) => {
        changed(nextValue, true);
        save?.();
      }}
      onChange={({ target: { value: nextValue } }) => {
        changed(nextValue);
      }}
      onPressEnter={() => save?.()}
      ref={inputRef}
      value={textVal}
    />
  );
}
