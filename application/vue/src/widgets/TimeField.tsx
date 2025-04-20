import { Form as AntdForm, TimePicker } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Rule } from "antd/es/form";
import dayjs, { Dayjs } from "dayjs";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

type TTimeField = {
  /**
   * The name of the input.
   * @type {(string | string[])}
   */
  readonly name: string | string[];

  /**
   * The base date value (used for date part)
   * @type {(Date)}
   */
  readonly baseValue: Date;

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
   * The inital value.
   * @type {T}
   */
  readonly initialValue?: Date;
};

export function TimeField({ name, label, required, initialValue, baseValue }: TTimeField) {
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
      initialValue={initialValue}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label + ":"}</b> : ""}
      name={name}
      rules={rules}
      style={label ? {} : { marginBottom: 0 }}
    >
      <TimeFieldEmbedded baseValue={baseValue} />
    </AntdForm.Item>
  );
}

function TimeFieldEmbedded({
  baseValue,
  value,
  onChange,
}: {
  readonly baseValue: Date;
  readonly value?: Date;
  readonly onChange?: (val: Date | undefined) => void;
}) {
  const valDayjs = useMemo(() => {
    if (value) {
      return dayjs(value);
    }
    return undefined;
  }, [value]);

  const updateValue = useCallback(
    (val?: Dayjs) => onChange!(val ? DatumUhrzeit.forJSDate(baseValue).setUhrzeit(val.hour(), val.minute()).toJSDate : undefined),
    [onChange, baseValue],
  );

  useEffect(() => {
    updateValue(valDayjs);
  }, [baseValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return <TimePicker format="HH:mm" minuteStep={15} onChange={updateValue} value={valDayjs} />;
}
