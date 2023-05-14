import { Button, ConfigProvider } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import * as React from "react";

type ButtonProps = {
  callback?: () => void;
  disabled?: boolean;
};
export function SaveButton({ callback, disabled }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#28a745" } }}>
      <Button htmlType="submit" icon={<IconForSmallBlock iconName="CheckSquare" />} type="primary" disabled={disabled}>
        &nbsp;Speichern
      </Button>
    </ConfigProvider>
  );
}

export function DeleteButton({ callback, disabled }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#dc3545" } }}>
      <Button icon={<IconForSmallBlock iconName="Trash" />} type="primary" disabled={disabled}>
        &nbsp;Löschen
      </Button>
    </ConfigProvider>
  );
}
export function CopyButton({ callback }: ButtonProps) {
  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#6c757d" } }}>
      <Button icon={<IconForSmallBlock iconName="Files" />} type="primary">
        &nbsp;Kopieren
      </Button>
    </ConfigProvider>
  );
}
