import { ConfigProvider } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useCallback, useState } from "react";
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
export default function InlineEditableActions({ actions }: { readonly actions: ActionCallbacks }) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const ok = useCallback(() => {
    actions.delete();
    setOpen(false);
  }, [actions]);
  const copy = useCallback(() => actions.copy(), [actions]);
  const remove = useCallback(() => actions.delete(), [actions]);

  return (
    <>
      <ConfigProvider theme={{ token: { colorPrimary: "#dc3545" } }}>
        <JazzModal cancelText="Och nö" closable={false} okText="Löschen" onCancel={close} onOk={ok} open={open} title="Löschen">
          <p>Die Zeile wird gelöscht.</p>
          <p>Bist Du sicher?.</p>
        </JazzModal>
      </ConfigProvider>
      <ButtonWithIcon icon="Files" key="copy" onClick={copy} tooltipPlacement="leftTop" tooltipTitle="Zeile Kopieren" type="text" />
      <ButtonWithIcon icon="Trash" key="delete" onClick={remove} tooltipPlacement="leftTop" tooltipTitle="Zeile Löschen" type="text" />
    </>
  );
}
