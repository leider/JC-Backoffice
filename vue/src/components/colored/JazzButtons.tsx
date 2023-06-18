import { App, Button, ConfigProvider } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { deleteVeranstaltungWithId } from "@/commons/loader-for-react";

type ButtonProps = {
  disabled?: boolean;
};
export function SaveButton({ disabled }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#28a745" } }}>
      <Button htmlType="submit" icon={<IconForSmallBlock iconName="CheckSquare" />} type="primary" disabled={disabled}>
        &nbsp;Speichern
      </Button>
    </ConfigProvider>
  );
}

export function SendButton({ disabled }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#28a745" } }}>
      <Button htmlType="submit" icon={<IconForSmallBlock iconName="Send" />} type="primary" disabled={disabled}>
        &nbsp;Senden
      </Button>
    </ConfigProvider>
  );
}

export function DeleteButton({ disabled, id }: ButtonProps & { id: string }) {
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
export function CopyButton({ disabled, url }: ButtonProps & { url?: string }) {
  const navigate = useNavigate();

  function callback() {
    if (!url) {
      return;
    }
    navigate(`/veranstaltung/copy-of-${url}`);
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#6c757d" } }}>
      <Button icon={<IconForSmallBlock iconName="Files" />} type="primary" disabled={disabled || !url} onClick={callback}>
        &nbsp;Kopieren
      </Button>
    </ConfigProvider>
  );
}
