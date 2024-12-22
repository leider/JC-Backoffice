import { ColorPicker, Form as AntdForm } from "antd";
import { FunctionComponent, useEffect, useState } from "react";
import { Rule } from "antd/es/form";

type TColorField = {
  name: string | string[];
  label?: string;
  required?: boolean;
  initialValue?: string;
  save?: () => void;
};

const colors: { [name: string]: string } = {
  firebrick: "#b22222",
  coral: "#ff7f50",
  blue: "#0000ff",
  dodgerblue: "#1e90ff",
  green: "#008000",
  yellowgreen: "#9acd32",
};

/**
 * @param {TColorField} props
 * @return {*}  {React.ReactElement}
 */
export const ColorField: FunctionComponent<TColorField> = ({
  name,
  label,
  required,
  initialValue,
  save,
}: TColorField & { presets?: string[] }): React.ReactElement => {
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
      valuePropName={"value"}
      trigger={"onChange"}
    >
      <ColorInputEmbedded save={save} />
    </AntdForm.Item>
  );
};

type TColorInputEmbedded = {
  value?: string;
  onChange?: (value: string) => void;
  save?: () => void;
};

const ColorInputEmbedded: FunctionComponent<TColorInputEmbedded> = ({ value, onChange, save }: TColorInputEmbedded) => {
  useEffect(() => {
    if (value && !value?.startsWith("#") && !value?.startsWith("rgb")) {
      onChange?.(colors[value.toLowerCase()] as string);
    }
  }, [value, onChange]);
  return (
    <ColorPicker
      open={true}
      size="small"
      presets={[{ label: "Schnellauswahl", colors: ["#b22222", "#ff7f50", "#0000ff", "#1e90ff", "#008000", "#9acd32"] }]}
      defaultFormat="hex"
      format="hex"
      value={value}
      onChange={(val) => onChange?.(val.toHexString())}
      onOpenChange={(open) => {
        if (!open) {
          save?.();
        }
      }}
    />
  );
};
