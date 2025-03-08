import { Checkbox, CheckboxProps, Form } from "antd";
import React, { useEffect, useState } from "react";
import { NamePath } from "rc-field-form/es/interface";

function InternalCheckbox({
  focus,
  focusByMouseClick,
  onChange,
  disabled,
  save,
  label,
  checked,
}: CheckboxProps & {
  label?: string;
  save?: (keepEditing?: boolean) => void;
  focus?: boolean;
  focusByMouseClick?: boolean;
}) {
  const [consumed, setConsumed] = useState(false);
  useEffect(() => {
    if (focusByMouseClick && !consumed) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      onChange?.(!checked);
      setConsumed(true);
    }
  }, [checked, consumed, focusByMouseClick, onChange, save]);

  useEffect(() => {
    if (consumed) {
      save?.(true);
    }
  }, [consumed]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Checkbox
      autoFocus={focus}
      checked={checked}
      disabled={disabled}
      onBlur={() => save?.()}
      onChange={(e) => {
        onChange?.(e);
        save?.(true);
      }}
    >
      {label && <b>{label}</b>}
    </Checkbox>
  );
}

export default function CheckItem({
  name,
  label,
  disabled,
  onChange,
  save,
  focus,
  focusByMouseClick,
}: Omit<CheckboxProps, "name"> & {
  name: NamePath;
  label?: string;
  save?: (keepEditing?: boolean) => void;
  focus?: boolean;
  focusByMouseClick?: boolean;
}) {
  return (
    <Form.Item name={name} style={label ? {} : { marginBottom: 0 }} valuePropName="checked">
      <InternalCheckbox
        disabled={disabled}
        focus={focus}
        focusByMouseClick={focusByMouseClick}
        label={label}
        onChange={onChange}
        save={save}
      />
    </Form.Item>
  );
}
