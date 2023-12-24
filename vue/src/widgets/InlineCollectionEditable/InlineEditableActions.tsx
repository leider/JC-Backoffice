import { Popconfirm } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";

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
export default function InlineEditableActions(props: { actions: ActionCallbacks; testid: string }): React.ReactElement {
  return (
    <>
      <ButtonWithIcon
        key="copy"
        type="text"
        icon="Files"
        onClick={props.actions.copy}
        tooltipTitle="Zeile Kopieren"
        tooltipPlacement="leftTop"
        data-testid={`${props.testid}_${"copy"}`}
      />
      <Popconfirm
        placement="topLeft"
        key="delete"
        title={"Wirklich löschen?"}
        onConfirm={props.actions.delete}
        okText="Ja"
        cancelText="Nein"
      >
        <ButtonWithIcon
          type="text"
          icon="Trash"
          tooltipTitle="Zeile Löschen"
          tooltipPlacement="leftTop"
          data-testid={`${props.testid}_delete`}
        />
      </Popconfirm>
    </>
  );
}
