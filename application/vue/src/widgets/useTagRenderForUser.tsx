import { CustomTagProps } from "rc-select/lib/BaseSelect";
import React from "react";
import { Tag } from "antd";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

export function useTagRenderForUser(usersAsOptions: LabelAndValue[]) {
  function tagRender({ value, closable, onClose }: CustomTagProps) {
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const label = usersAsOptions.filter((item) => item.value === value)?.[0]?.label;

    return (
      <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose} style={{ marginRight: 3, paddingInline: 3 }}>
        {label}
      </Tag>
    );
  }

  return tagRender;
}
