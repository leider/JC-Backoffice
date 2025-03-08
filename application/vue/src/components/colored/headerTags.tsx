import { Tag } from "antd";
import * as React from "react";
import map from "lodash/map";

type LabelColor = {
  label: string;
  color: boolean;
};

export default function headerTags(labelsColors: LabelColor[], withStyle = false) {
  function HeaderTag({ label, color }: LabelColor) {
    return (
      <Tag color={color ? "success" : "error"} key={label} style={withStyle ? { border: 0 } : undefined}>
        {label}
      </Tag>
    );
  }
  return map(labelsColors, (tag) => <HeaderTag color={tag.color} key={tag.label} label={tag.label} />);
}
