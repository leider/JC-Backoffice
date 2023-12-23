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
 * Table actions.
 * @export
 * @param {{
 *   actions: ActionCallbacks;
 * }} props
 * @return {*}  {React.ReactElement}
 */
export default function InlineEditableActions(props: { actions: ActionCallbacks; testid: string }): React.ReactElement {
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
        <Tooltip placement="left" title={tooltipWithKey[key]} key={key}>
          <Popconfirm
            placement="topLeft"
            key="delete"
            title={"Wirklich löschen?"}
            onConfirm={props.actions.delete?.callback}
            okText="Ja"
            cancelText="Nein"
          >
            <Button type="text" icon={iconForKey(key)} data-testid={`${props.testid}_delete`} />
          </Popconfirm>
        </Tooltip>
      ) : (
        <Tooltip title={tooltipWithKey[key]} key={key}>
          <Button type="text" icon={iconForKey(key)} onClick={props.actions.delete?.callback} data-testid={`${props.testid}_delete`} />
        </Tooltip>
      );
    }
    if (key === "empty") {
      return <Button key={key} type="text" icon={iconForKey(key)} />;
    }

    return (
      <Tooltip placement="left" title={tooltipWithKey[key]} key={key}>
        <Button type="text" icon={iconForKey(key)} onClick={props.actions[key]} data-testid={`${props.testid}_${key}`} />
      </Tooltip>
    );
  }

  const tooltipWithKey = {
    copy: "Kopieren",
    edit: "Bearbeiten",
    delete: "Löschen",
    view: "Anzeigen",
  };

  const items = ["copy", "edit", "delete", "view", "empty"]
    .map((key) => createItem(key as "copy" | "edit" | "view" | "delete" | "empty"))
    .filter((each) => !!each);
  return <>{items}</>;
}
