import { useEffect } from "react";
import { ColorPicker } from "antd";

const colors: { [name: string]: string } = {
  firebrick: "#b22222",
  coral: "#ff7f50",
  blue: "#0000ff",
  dodgerblue: "#1e90ff",
  green: "#008000",
  yellowgreen: "#9acd32",
};

export default function ColorInTable({ value, onChange, save }: { value?: string; onChange?: (value: string) => void; save: () => void }) {
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
          save();
        }
      }}
    />
  );
}
