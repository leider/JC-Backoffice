import { App, Button, ConfigProvider, Dropdown, Space } from "antd";
import { IconForSmallBlock } from "@/components/Icon";
import * as React from "react";
import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteVeranstaltungWithId, deleteVermietungWithId, imgzipForVeranstaltung, openKassenzettel } from "@/commons/loader.ts";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import { asExcelKalk } from "@/commons/utilityFunctions.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";

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

export function NewButtons() {
  const navigate = useNavigate();
  const items = [
    { key: "Veranstaltung", label: "Neue Veranstaltung", icon: <IconForSmallBlock iconName="FileEarmarkPlus" /> },
    { key: "Vermietung", label: "Neue Vermietung", icon: <IconForSmallBlock iconName="FileEarmarkEasel" /> },
  ];
  function onMenuClick(e: { key: string }): void {
    if (e.key === "Veranstaltung") {
      return navigate("/veranstaltung/new");
    }
    if (e.key === "Vermietung") {
      return navigate("/vermietung/new");
    }
  }
  return (
    <Dropdown menu={{ items, onClick: onMenuClick }}>
      <Button type="default">
        <Space>
          Neu <IconForSmallBlock iconName="ChevronDown" />
        </Space>
      </Button>
    </Dropdown>
  );
}
export function ExportButtons({ disabled }: ButtonProps) {
  const context = useContext(VeranstaltungContext);
  const form = context!.form;
  const veranstaltung = useMemo(() => form.getFieldsValue(true), [form]);

  const items = [
    { key: "ExcelKalk", label: "Kalkulation (Excel)", icon: <IconForSmallBlock iconName="FileEarmarkSpreadsheet" /> },
    { key: "Pressefotos", label: "Pressefotos (Zip)", icon: <IconForSmallBlock iconName="FileEarmarkImage" /> },
    { key: "Kassenzettel", label: "Kassenzettel (Pdf)", icon: <IconForSmallBlock iconName="Printer" /> },
  ];

  function onMenuClick(e: { key: string }): void {
    if (e.key === "ExcelKalk") {
      asExcelKalk([new Veranstaltung(veranstaltung)]);
    }
    if (e.key === "Pressefotos") {
      imgzipForVeranstaltung(veranstaltung);
    }
    if (e.key === "Kassenzettel") {
      openKassenzettel(veranstaltung);
    }
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5900b9" } }}>
      <Dropdown menu={{ items, onClick: onMenuClick }} disabled={disabled}>
        <Button type="primary">
          <Space>
            Exportieren <IconForSmallBlock iconName="ChevronDown" />
          </Space>
        </Button>
      </Dropdown>
    </ConfigProvider>
  );
}

export function ExportExcelVermietungButton({ disabled }: ButtonProps) {
  const context = useContext(VermietungContext);
  const form = context!.form;

  const vermietung = useMemo(() => form.getFieldsValue(true), [form]);

  function click() {
    asExcelKalk([new Vermietung(vermietung)]);
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#5900b9" } }}>
      <Button type="primary" disabled={disabled} icon={<IconForSmallBlock iconName="FileEarmarkSpreadsheet" />} onClick={click}>
        Kalkulation (Excel)
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
