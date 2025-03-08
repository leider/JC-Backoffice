import { Checkbox, CheckboxProps } from "antd";
import { useEffect, useState } from "react";
import * as React from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";

export default function InverseCheckbox({ checked, onChange, ...rest }: CheckboxProps) {
  const [inverseChecked, setInverseChecked] = useState<boolean>(false);
  useEffect(() => {
    if (checked !== undefined) {
      setInverseChecked(!checked);
    }
  }, [checked]);

  function privateOnChange(e: CheckboxChangeEvent) {
    e.target.checked = !e.target.checked;
    onChange?.(e);
  }

  return <Checkbox {...rest} checked={inverseChecked} onChange={privateOnChange} />;
}
