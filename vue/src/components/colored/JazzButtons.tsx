import { App, Button, ConfigProvider, Dropdown, Space, theme } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import * as React from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { deleteVeranstaltungWithId, deleteVermietungWithId, imgzipForVeranstaltung, openKassenzettel } from "@/commons/loader.ts";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import { asExcelKalk } from "@/commons/utilityFunctions.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import Konzert from "../../../../shared/konzert/konzert.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import ButtonWithIconAndLink from "@/widgets/buttonsAndIcons/ButtonWithIconAndLink.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ButtonProps = {
  disabled?: boolean;
};
function SaveOrSendButton({ disabled, isSend }: ButtonProps & { isSend: boolean }) {
  const { useToken } = theme;
  const token = useToken().token;

  return (
    <ButtonWithIcon
      text={isSend ? "Senden" : "Speichern"}
      onClick="submit"
      icon={isSend ? "Send" : "CheckSquare"}
      disabled={disabled}
      color={token.colorSuccess}
    />
  );
}

export function SaveButton({ disabled }: ButtonProps) {
  return <SaveOrSendButton isSend={false} disabled={disabled} />;
}

export function SendButton({ disabled }: ButtonProps) {
  return <SaveOrSendButton isSend={true} disabled={disabled} />;
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

  const items = [
    { key: "ExcelKalk", label: "Kalkulation (Excel)", icon: <IconForSmallBlock iconName="FileEarmarkSpreadsheet" /> },
    { key: "Pressefotos", label: "Pressefotos (Zip)", icon: <IconForSmallBlock iconName="FileEarmarkImage" /> },
    { key: "Kassenzettel", label: "Kassenzettel (Pdf)", icon: <IconForSmallBlock iconName="Printer" /> },
  ];

  function onMenuClick(e: { key: string }): void {
    const veranstaltung = form.getFieldsValue(true);
    if (e.key === "ExcelKalk") {
      asExcelKalk([new Konzert(veranstaltung)]);
    }
    if (e.key === "Pressefotos") {
      imgzipForVeranstaltung(new Konzert(veranstaltung));
    }
    if (e.key === "Kassenzettel") {
      openKassenzettel(new Konzert(veranstaltung));
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

  function click() {
    asExcelKalk([new Vermietung(form.getFieldsValue(true))]);
  }

  return <ButtonWithIcon text="Kalkulation (Excel)" disabled={disabled} icon="FileEarmarkSpreadsheet" onClick={click} color="#5900b9" />;
}

export function DeleteButton({ disabled, id, isVermietung }: ButtonProps & { id: string; isVermietung?: boolean }) {
  const { modal } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteVeranstaltung = useMutation({
    mutationFn: deleteVeranstaltungWithId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung"] });
      navigate("/");
    },
  });
  const deleteVermietung = useMutation({
    mutationFn: deleteVermietungWithId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vermietung"] });
      navigate("/");
    },
  });
  function callback() {
    modal.confirm({
      type: "confirm",
      title: `${isVermietung ? "Vermietung" : "Veranstaltung"} löschen`,
      content: `Bist Du sicher, dass Du die ${isVermietung ? "Vermietung" : "Veranstaltung"} "${document.title}" löschen möchtest?`,
      onOk: () => {
        isVermietung ? deleteVermietung.mutate(id) : deleteVeranstaltung.mutate(id);
      },
    });
  }

  return <ButtonWithIcon text="Löschen" icon="Trash" disabled={disabled} onClick={callback} color="#dc3545" />;
}
export function CopyButton({ disabled, url, isVermietung }: ButtonProps & { url?: string; isVermietung?: boolean }) {
  return (
    <ButtonWithIconAndLink
      icon="Files"
      to={`/${isVermietung ? "vermietung" : "veranstaltung"}/copy-of-${url}`}
      color="#6c757d"
      text="Kopieren"
      disabled={disabled || !url}
    />
  );
}
