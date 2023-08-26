import { Button, Popconfirm, Tooltip } from "antd";
import { CopyOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
export interface ActionCallbacks {
  //[index: string]: undefined | any;
  copy?: () => void;
  edit?: () => void;
  view?: () => void;
  delete?: { callback: () => void; confirm?: boolean };
  empty?: string;
}

type Actions = keyof ActionCallbacks;

/**
 * Orrp table actions.
 * @export
 * @param {{
 *   actions: ActionCallbacks;
 * }} props
 * @return {*}  {JSX.Element}
 */
export default function OrrpTableActions(props: { actions: ActionCallbacks; testid: string }): JSX.Element {
  function iconForKey(key: Actions) {
    switch (key) {
      case "copy":
        return <CopyOutlined />;
      case "edit":
        return <EditOutlined />;
      case "delete":
        return <DeleteOutlined />;
      case "view":
        return <EyeOutlined />;
      case "empty":
        return <EyeOutlined style={{ color: "#FFF" }} />;
    }
  }

  function createItem(key: Actions) {
    if (!props.actions[key]) {
      return undefined;
    }
    if (key === "delete") {
      return !props.actions.delete?.confirm ? (
        <Tooltip title={key} key={key}>
          <Popconfirm
            placement="topLeft"
            key="delete"
            title={"Witklich löschen?"}
            onConfirm={props.actions.delete.callback}
            okText="Ja"
            cancelText="Nein"
          >
            <Button type="text" icon={iconForKey(key)} data-testid={`${props.testid}_delete`} />
          </Popconfirm>
        </Tooltip>
      ) : (
        <Tooltip title={key} key={key}>
          <Button type="text" icon={iconForKey(key)} onClick={props.actions.delete?.callback} data-testid={`${props.testid}_delete`} />
        </Tooltip>
      );
    }
    if (key === "empty") {
      return <Button key={key} type="text" icon={iconForKey(key)} />;
    }

    return (
      <Tooltip title={key} key={key}>
        <Button type="text" icon={iconForKey(key)} onClick={props.actions[key]} data-testid={`${props.testid}_${key}`} />
      </Tooltip>
    );
  }

  const items = ["copy", "edit", "delete", "view", "empty"]
    .map((key) => createItem(key as "copy" | "edit" | "view" | "delete" | "empty"))
    .filter((each) => !!each);
  return <>{items}</>;
}
