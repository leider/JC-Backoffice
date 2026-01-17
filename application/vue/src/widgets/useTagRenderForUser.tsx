import type { CustomTagProps } from "@rc-component/select/es/BaseSelect";
import React, { useCallback } from "react";
import { Tag } from "antd";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { TagForUser } from "@/widgets/TagForUser.tsx";

export function useTagRenderForUser(usersAsOptions: UserWithKann[]) {
  const onPreventMouseDown = useCallback((event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  function tagRender({ isMaxTag, value, closable, onClose }: CustomTagProps) {
    return isMaxTag ? (
      <Tag>Es gibt mehr...</Tag>
    ) : (
      <Tag closable={closable} onClose={onClose} onMouseDown={onPreventMouseDown}>
        <TagForUser usersAsOptions={usersAsOptions} value={value} />
      </Tag>
    );
  }

  return tagRender;
}
