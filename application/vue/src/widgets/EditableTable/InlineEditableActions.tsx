import { ConfigProvider } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useState } from "react";
import { JazzModal } from "@/widgets/JazzModal.tsx";

export interface ActionCallbacks {
  copy: () => void;
  delete: () => void;
}

/**
 * Table actions.
 * @export
 * @param {{
 *   actions: ActionCallbacks;
 * }} props
 * @return {*}  {React.ReactElement}
 */
export default function InlineEditableActions({ actions }: { actions: ActionCallbacks }): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ConfigProvider theme={{ token: { colorPrimary: "#dc3545" } }}>
        <JazzModal
          title="Löschen"
          closable={false}
          open={open}
          onOk={() => {
            actions.delete();
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
          okText="Löschen"
          cancelText="Och nö"
        >
          <p>Die Zeile wird gelöscht.</p>
          <p>Bist Du sicher?.</p>
        </JazzModal>
      </ConfigProvider>
      <ButtonWithIcon key="copy" type="text" icon="Files" onClick={actions.copy} tooltipTitle="Zeile Kopieren" tooltipPlacement="leftTop" />
      <ButtonWithIcon
        key="delete"
        type="text"
        icon="Trash"
        onClick={() => setOpen(true)}
        tooltipTitle="Zeile Löschen"
        tooltipPlacement="leftTop"
      />
    </>
  );
}
