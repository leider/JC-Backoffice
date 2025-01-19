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
      <Tag key={label} color={color ? "success" : "error"} style={withStyle ? { border: 0 } : undefined}>
        {label}
      </Tag>
    );
  }
  return map(labelsColors, (tag) => <HeaderTag key={tag.label} label={tag.label} color={tag.color} />);
}
