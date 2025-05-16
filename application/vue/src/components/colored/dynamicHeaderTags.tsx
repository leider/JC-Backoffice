import { Tag } from "antd";
import * as React from "react";
import { useMemo } from "react";
import { NamePath } from "rc-field-form/es/interface";
import { useWatch } from "antd/es/form/Form";
import map from "lodash/map";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export type LabelPathDependsOn = {
  label: string;
  labelNotOk?: string;
  path: NamePath;
  dependsOn?: NamePath;
  invertColor?: boolean;
};

export default function dynamicHeaderTags(labelsColors: LabelPathDependsOn[]) {
  function HeaderTag({ tag: { label, labelNotOk, dependsOn, path, invertColor } }: { readonly tag: LabelPathDependsOn }) {
    const { isDarkMode } = useJazzContext();
    const colorDisabled = useMemo(() => (isDarkMode ? "rgb(255,255,255,0.45)" : "rgb(0,0,0,0.45)"), [isDarkMode]);

    const isOK: boolean = useWatch(path, { preserve: true });
    const prerequisite: boolean = useWatch(dependsOn, { preserve: true });
    const showTag: boolean = (dependsOn && prerequisite) || !dependsOn;
    const isOptional = !showTag;
    let color: undefined | string;
    if (isOptional) {
      color = undefined;
    } else {
      if (invertColor ? !isOK : isOK) {
        color = "success";
      } else {
        color = "error";
      }
    }
    const theLabel = isOK ? label : (labelNotOk ?? label);
    return (
      <Tag color={color} style={isOptional ? { color: colorDisabled } : {}}>
        {theLabel}
      </Tag>
    );
  }

  return map(labelsColors, (tag) => <HeaderTag key={tag.label ?? tag.label} tag={tag} />);
}
