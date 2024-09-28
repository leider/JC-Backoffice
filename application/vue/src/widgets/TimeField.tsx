import { Form as AntdForm, TimePicker } from "antd";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Rule } from "antd/es/form";
import dayjs, { Dayjs } from "dayjs";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit.ts";

type TTimeField = {
  /**
   * The name of the input.
   * @type {(string | string[])}
   */
  name: string | string[];

  /**
   * The base date value (used for date part)
   * @type {(Date)}
   */
  baseValue: Date;

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
   * The inital value.
   * @type {T}
   */
  initialValue?: Date;
};

/**
 * @param {TTimeField} props
 * @return {*}  {React.ReactElement}
 */
export const TimeField: FunctionComponent<TTimeField> = ({
  name,
  label,
  required,
  initialValue,
  baseValue,
}: TTimeField): React.ReactElement => {
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
      name={name}
      label={label ? <b style={{ whiteSpace: "nowrap" }}>{label}:</b> : ""}
      rules={rules}
      style={label ? {} : { marginBottom: 0 }}
      initialValue={initialValue}
    >
      <TimeFieldEmbedded baseValue={baseValue} />
    </AntdForm.Item>
  );
};

const TimeFieldEmbedded = ({
  baseValue,
  value,
  onChange,
}: {
  baseValue: Date;
  value?: Date;
  onChange?: (val: Date | undefined) => void;
}) => {
  const valDayjs = useMemo(() => {
    if (value) {
      return dayjs(value);
    }
    return undefined;
  }, [value]);

  function updateValue(val?: Dayjs) {
    onChange!(val ? DatumUhrzeit.forJSDate(baseValue).setUhrzeit(val.hour(), val.minute()).toJSDate : undefined);
  }

  useEffect(() => {
    updateValue(valDayjs);
  }, [baseValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return <TimePicker format="HH:mm" minuteStep={15} value={valDayjs} onChange={updateValue} />;
};
