import { CustomTagProps } from "rc-select/lib/BaseSelect";
import React from "react";
import { Tag } from "antd";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { TagForUser } from "@/widgets/TagForUser.tsx";

export function useTagRenderForUser(usersAsOptions: UserWithKann[]) {
  function tagRender({ value, closable, onClose }: CustomTagProps) {
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <Tag onMouseDown={onPreventMouseDown} closable={closable} onClose={onClose} style={{ marginRight: 3, paddingInline: 3 }}>
        <TagForUser value={value} usersAsOptions={usersAsOptions} />
      </Tag>
    );
  }

  return tagRender;
}
