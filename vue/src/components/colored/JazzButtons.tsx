import { App, Button, ConfigProvider } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { deleteVeranstaltungWithId } from "@/commons/loader-for-react";

type ButtonProps = {
  callback?: () => void;
  disabled?: boolean;
};
export function SaveButton({ callback, disabled }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#28a745" } }}>
      <Button htmlType="submit" icon={<IconForSmallBlock iconName="CheckSquare" />} type="primary" disabled={disabled} onClick={callback}>
        &nbsp;Speichern
      </Button>
    </ConfigProvider>
  );
}

export function DeleteButton({ disabled }: ButtonProps) {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  function callback() {
    modal.confirm({
      type: "confirm",
      title: "Veranstaltung löschen",
      content: `Bist Du sicher, dass Du die Veranstaltung "${document.title}" löschen möchtest?`,
      onOk: async () => {
        await deleteVeranstaltungWithId(id);
        navigate("/");
      },
    });
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#dc3545" } }}>
      <Button icon={<IconForSmallBlock iconName="Trash" />} type="primary" disabled={disabled} onClick={callback}>
        &nbsp;Löschen
      </Button>
    </ConfigProvider>
  );
}
export function CopyButton({ callback, disabled }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#6c757d" } }}>
      <Button icon={<IconForSmallBlock iconName="Files" />} type="primary" disabled={disabled} onClick={callback}>
        &nbsp;Kopieren
      </Button>
    </ConfigProvider>
  );
}
