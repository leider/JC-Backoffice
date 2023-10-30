import { Tag } from "antd";
import * as React from "react";

export interface LabelColor {
  label: string;
  color: boolean;
}

export default function headerTags(labelsColors: LabelColor[], withStyle = false) {
  function HeaderTag({ label, color }: LabelColor) {
    return (
      <Tag key={label} color={color ? "success" : "error"} style={withStyle ? { border: 0, paddingLeft: 3, paddingRight: 3 } : {}}>
        {label}
      </Tag>
    );
  }
  return labelsColors.map((tag) => <HeaderTag key={tag.label} label={tag.label} color={tag.color}></HeaderTag>);
}
