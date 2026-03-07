import { Checkbox, CheckboxProps } from "antd";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";

export default function InverseCheckbox({ checked, onChange, ...rest }: CheckboxProps) {
  const inverseChecked = useMemo(() => {
    if (checked !== undefined) {
      return !checked;
    }
  }, [checked]);

  const privateOnChange = useCallback(
    (e: CheckboxChangeEvent) => {
      e.target.checked = !e.target.checked;
      onChange?.(e);
    },
    [onChange],
  );

  return <Checkbox {...rest} checked={inverseChecked} onChange={privateOnChange} />;
}
