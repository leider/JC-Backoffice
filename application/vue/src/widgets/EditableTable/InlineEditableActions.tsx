import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import React, { memo, useCallback } from "react";

/**
 * Copy / delete controls for one editable table row. Pass stable callbacks from the parent (e.g. via EditableRowActions).
 */
function InlineEditableActions({ onCopy, onDelete }: { readonly onCopy: () => void; readonly onDelete: () => void }) {
  const copy = useCallback(() => onCopy(), [onCopy]);
  const remove = useCallback(() => onDelete(), [onDelete]);

  return (
    <>
      <ButtonWithIcon icon="Files" key="copy" onClick={copy} tooltipPlacement="leftTop" tooltipTitle="Zeile Kopieren" type="text" />
      <ButtonWithIcon icon="Trash" key="delete" onClick={remove} tooltipPlacement="leftTop" tooltipTitle="Zeile Löschen" type="text" />
    </>
  );
}

export default memo(InlineEditableActions);
