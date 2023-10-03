import { App, Button, ConfigProvider } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { deleteVeranstaltungWithId, deleteVermietungWithId } from "@/commons/loader.ts";

type ButtonProps = {
  disabled?: boolean;
};
export function SaveButton({ disabled }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#28a745" } }}>
      <Button htmlType="submit" icon={<IconForSmallBlock iconName="CheckSquare" />} type="primary" disabled={disabled}>
        Speichern
      </Button>
    </ConfigProvider>
  );
}

export function SendButton({ disabled }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#28a745" } }}>
      <Button htmlType="submit" icon={<IconForSmallBlock iconName="Send" />} type="primary" disabled={disabled}>
        Senden
      </Button>
    </ConfigProvider>
  );
}

export function DeleteButton({ disabled, id, isVermietung }: ButtonProps & { id: string; isVermietung?: boolean }) {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  function callback() {
    modal.confirm({
      type: "confirm",
      title: `${isVermietung ? "Vermietung" : "Veranstaltung"} löschen`,
      content: `Bist Du sicher, dass Du die ${isVermietung ? "Vermietung" : "Veranstaltung"} "${document.title}" löschen möchtest?`,
      onOk: async () => {
        (await isVermietung) ? deleteVermietungWithId(id) : deleteVeranstaltungWithId(id);
        navigate("/");
      },
    });
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#dc3545" } }}>
      <Button icon={<IconForSmallBlock iconName="Trash" />} type="primary" disabled={disabled} onClick={callback}>
        Löschen
      </Button>
    </ConfigProvider>
  );
}
export function CopyButton({ disabled, url, isVermietung }: ButtonProps & { url?: string; isVermietung?: boolean }) {
  const navigate = useNavigate();

  function callback() {
    if (!url) {
      return;
    }
    navigate(`/${isVermietung ? "vermietung" : "veranstaltung"}/copy-of-${url}`);
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#6c757d" } }}>
      <Button icon={<IconForSmallBlock iconName="Files" />} type="primary" disabled={disabled || !url} onClick={callback}>
        &nbsp;Kopieren
      </Button>
    </ConfigProvider>
  );
}
