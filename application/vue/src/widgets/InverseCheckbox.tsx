import { Checkbox, CheckboxProps } from "antd";
import { useEffect, useState } from "react";
import * as React from "react";
import { CheckboxChangeEvent } from "antd/es/checkbox";

export default function InverseCheckbox(props: CheckboxProps) {
  const [inverseChecked, setInverseChecked] = useState<boolean>(false);
  useEffect(() => {
    if (props.checked !== undefined) {
      setInverseChecked(!props.checked);
    }
  }, [props.checked]);

  function privateOnChange(e: CheckboxChangeEvent) {
    e.target.checked = !e.target.checked;
    props.onChange?.(e);
  }

  return <Checkbox {...props} checked={inverseChecked} onChange={privateOnChange} />;
}
