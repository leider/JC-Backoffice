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
          cancelText="Och nö"
          closable={false}
          okText="Löschen"
          onCancel={() => setOpen(false)}
          onOk={() => {
            actions.delete();
            setOpen(false);
          }}
          open={open}
          title="Löschen"
        >
          <p>Die Zeile wird gelöscht.</p>
          <p>Bist Du sicher?.</p>
        </JazzModal>
      </ConfigProvider>
      <ButtonWithIcon icon="Files" key="copy" onClick={actions.copy} tooltipPlacement="leftTop" tooltipTitle="Zeile Kopieren" type="text" />
      <ButtonWithIcon
        icon="Trash"
        key="delete"
        onClick={() => setOpen(true)}
        tooltipPlacement="leftTop"
        tooltipTitle="Zeile Löschen"
        type="text"
      />
    </>
  );
}
