import { ConfigProvider, Modal } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useState } from "react";

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
export default function InlineEditableActions(props: { actions: ActionCallbacks }): React.ReactElement {
  const [open, setOpen] = useState(false);
  return (
    <>
      <ConfigProvider theme={{ token: { colorPrimary: "#dc3545" } }}>
        <Modal
          title="Löschen"
          closable={false}
          open={open}
          onOk={() => {
            props.actions.delete();
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
          okText="Löschen"
          cancelText="Och nö"
        >
          <p>Die Zeile wird gelöscht.</p>
          <p>Bist Du sicher?.</p>
        </Modal>
      </ConfigProvider>
      <ButtonWithIcon
        key="copy"
        type="text"
        icon="Files"
        onClick={props.actions.copy}
        tooltipTitle="Zeile Kopieren"
        tooltipPlacement="leftTop"
      />
      <ButtonWithIcon type="text" icon="Trash" tooltipTitle="Zeile Löschen" tooltipPlacement="leftTop" onClick={() => setOpen(true)} />
    </>
  );
}
