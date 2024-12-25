import { Checkbox, CheckboxProps, Form } from "antd";
import React, { useEffect, useState } from "react";

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
  save?: () => void;
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
  }, [checked, consumed, focusByMouseClick, onChange]);

  return (
    <Checkbox autoFocus={focus} checked={checked} onChange={onChange} disabled={disabled} onBlur={save}>
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
}: CheckboxProps & {
  label?: string;
  save?: () => void;
  focus?: boolean;
  focusByMouseClick?: boolean;
}) {
  return (
    <Form.Item name={name} style={label ? {} : { marginBottom: 0 }} valuePropName="checked">
      <InternalCheckbox
        label={label}
        focus={focus}
        focusByMouseClick={focusByMouseClick}
        onChange={onChange}
        disabled={disabled}
        save={save}
      />
    </Form.Item>
  );
}
