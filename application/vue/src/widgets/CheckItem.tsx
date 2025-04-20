import { Checkbox, CheckboxProps, Form } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { NamePath } from "rc-field-form/es/interface";
import { CheckboxChangeEvent } from "antd/es/checkbox";

function InternalCheckbox({
  focus,
  focusByMouseClick,
  onChange,
  disabled,
  save,
  label,
  checked,
}: CheckboxProps & {
  readonly label?: string;
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
  readonly focusByMouseClick?: boolean;
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

  const onBlur = useCallback(() => save?.(), [save]);
  const onChangeCallback = useCallback(
    (e: CheckboxChangeEvent) => {
      onChange?.(e);
      save?.(true);
    },
    [onChange, save],
  );

  return (
    <Checkbox autoFocus={focus} checked={checked} disabled={disabled} onBlur={onBlur} onChange={onChangeCallback}>
      {label ? <b>{label}</b> : null}
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
  readonly name: NamePath;
  readonly label?: string;
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
  readonly focusByMouseClick?: boolean;
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
