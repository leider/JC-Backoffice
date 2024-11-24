import { CustomTagProps } from "rc-select/lib/BaseSelect";
import React, { useMemo } from "react";
import { Tag } from "antd";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { ErsthelferSymbol } from "@/widgets/ErsthelferSymbol.tsx";

export function useTagRenderForUser(usersAsOptions: UserWithKann[]) {
  function TagForUser({ value }: { value: string }) {
    const userWithKann = useMemo(() => usersAsOptions.filter((item) => item.value === value)?.[0], [value]);
    const label = userWithKann.label;

    const ersthelfer = useMemo(() => {
      return userWithKann?.kann.includes("Ersthelfer");
    }, [userWithKann?.kann]);

    return (
      <>
        {label}
        {ersthelfer && <ErsthelferSymbol />}
      </>
    );
  }

  function tagRender({ value, closable, onClose }: CustomTagProps) {
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose} style={{ marginRight: 3, paddingInline: 3 }}>
        <TagForUser value={value} />
      </Tag>
    );
  }

  return tagRender;
}
