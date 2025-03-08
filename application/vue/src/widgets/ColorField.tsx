import { ColorPicker, Form as AntdForm } from "antd";
import { useEffect, useState } from "react";
import { Rule } from "antd/es/form";

type TColorField = {
  readonly name: string | string[];
  readonly label?: string;
  readonly required?: boolean;
  readonly initialValue?: string;
  readonly save?: (keepEditing?: boolean) => void;
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
export function ColorField({
  name,
  label,
  required,
  initialValue,
  save,
  presets,
}: TColorField & { readonly presets?: boolean }): React.ReactElement {
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
      trigger="onChange"
      valuePropName="value"
    >
      <ColorInputEmbedded presets={presets} save={save} />
    </AntdForm.Item>
  );
}

type TColorInputEmbedded = {
  readonly value?: string;
  readonly onChange?: (value: string) => void;
  readonly save?: (keepEditing?: boolean) => void;
  readonly presets?: boolean;
};

function ColorInputEmbedded({ value, onChange, save, presets }: TColorInputEmbedded) {
  useEffect(() => {
    if (value && !value?.startsWith("#") && !value?.startsWith("rgb")) {
      onChange?.(colors[value.toLowerCase()] as string);
    }
  }, [value, onChange]);

  return (
    <ColorPicker
      defaultFormat="hex"
      format="hex"
      onChange={(val) => {
        onChange?.(val.toHexString());
        save?.(true);
      }}
      onOpenChange={(open) => {
        if (!open) {
          save?.();
        }
      }}
      open
      presets={
        presets
          ? [
              {
                label: "Schnellauswahl",
                colors: ["#b22222", "#ff7f50", "#0000ff", "#1e90ff", "#008000", "#9acd32"],
              },
            ]
          : undefined
      }
      size="small"
      value={value}
    />
  );
}
