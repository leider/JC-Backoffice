import { CustomTagProps } from "rc-select/lib/BaseSelect";
import React, { useCallback } from "react";
import { Tag } from "antd";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { TagForUser } from "@/widgets/TagForUser.tsx";

export function useTagRenderForUser(usersAsOptions: UserWithKann[]) {
  const onPreventMouseDown = useCallback((event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  function tagRender({ value, closable, onClose }: CustomTagProps) {
    return (
      <Tag closable={closable} onClose={onClose} onMouseDown={onPreventMouseDown}>
        <TagForUser usersAsOptions={usersAsOptions} value={value} />
      </Tag>
    );
  }

  return tagRender;
}
