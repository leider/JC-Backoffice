import { App, Button, Dropdown, Space, theme } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import { deleteKonzertWithId, deleteVermietungWithId, imgzipForVeranstaltung, openKassenzettel } from "@/commons/loader.ts";
import { asExcelKalkSingle } from "@/commons/excel/single.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ItemType } from "antd/es/menu/interface";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { SizeType } from "antd/es/config-provider/SizeContext";

type ButtonProps = {
  disabled?: boolean;
  size?: SizeType;
};

function SaveOrSendButton({ disabled, isSend, size, callback }: ButtonProps & { isSend?: boolean; callback?: () => void }) {
  const { token } = theme.useToken();
  return (
    <ButtonWithIcon
      text={isSend ? "Senden" : "Speichern"}
      onClick={callback ? callback : "submit"}
      icon={isSend ? "Send" : "CheckSquare"}
      disabled={disabled}
      color={token.colorSuccess}
      size={size}
    />
  );
}

export function HelpWithKasseButton({ callback }: { callback: () => void }) {
  const token = theme.useToken().token;

  return <ButtonWithIcon alwaysText text="Abendkasse Hilfe" onClick={callback} icon="QuestionCircleFill" color={token.colorSuccess} />;
}

export function SaveButton({ disabled, size, callback }: ButtonProps & { callback?: () => void }) {
  return <SaveOrSendButton disabled={disabled} callback={callback} size={size} />;
}

export function SendButton({ disabled }: ButtonProps) {
  return <SaveOrSendButton isSend disabled={disabled} />;
}

export function ResetButton({ disabled, size, resetChanges }: ButtonProps & { resetChanges: () => Promise<unknown> | void }) {
  const { token } = theme.useToken();
  return (
    <ButtonWithIcon
      text="Reset"
      onClick={resetChanges}
      icon="ArrowCounterclockwise"
      disabled={disabled}
      type="default"
      color={token.colorSuccess}
      size={size}
    />
  );
}

export function NewButtons() {
  const navigate = useNavigate();
  const items = [
    { key: "Konzert", label: "Neues Konzert", icon: <IconForSmallBlock iconName="FileEarmarkPlus" /> },
    { key: "Vermietung", label: "Neue Vermietung", icon: <IconForSmallBlock iconName="FileEarmarkEasel" /> },
  ];
  function onClick(e: { key: string }) {
    if (e.key === "Konzert") {
      return navigate("/konzert/new");
    }
    if (e.key === "Vermietung") {
      return navigate("/vermietung/new");
    }
  }
  return (
    <Dropdown menu={{ items, onClick }}>
      <Button type="default">
        <Space>
          Neu <IconForSmallBlock iconName="ChevronDown" />
        </Space>
      </Button>
    </Dropdown>
  );
}

export function MoreButton({ disabled, isDirty, isVermietung }: ButtonProps & { isDirty: boolean; isVermietung?: boolean }) {
  const form = useFormInstance();
  const { optionen } = useJazzContext();
  const getKonzert = useCallback(() => new Konzert(form.getFieldsValue(true)), [form]);
  const getVermietung = useCallback(() => new Vermietung(form.getFieldsValue(true)), [form]);

  const { modal } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteKonzert = useMutation({
    mutationFn: deleteKonzertWithId,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["konzert"] });
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

  const colorExport = useMemo(() => (isDirty ? "rgba(89,0,185,0.43)" : "#5900b9"), [isDirty]);

  const konzertExport = {
    type: "group",
    key: "export",
    label: <span style={{ color: colorExport }}>Exportieren</span>,
    children: [
      {
        key: "ExcelKalk",
        label: <span style={{ color: colorExport }}>Kalkulation (Excel)</span>,
        icon: <IconForSmallBlock color={colorExport} iconName="FileEarmarkSpreadsheet" />,
        disabled: isDirty,
      },
      {
        key: "Pressefotos",
        label: <span style={{ color: colorExport }}>Pressefotos (Zip)</span>,
        icon: <IconForSmallBlock color={colorExport} iconName="FileEarmarkImage" />,
        disabled: isDirty,
      },
      {
        key: "Kassenzettel",
        label: <span style={{ color: colorExport }}>Kassenzettel (Pdf)</span>,
        icon: <IconForSmallBlock color={colorExport} iconName="Printer" />,
        disabled: isDirty,
      },
    ],
  };

  const vermietungExport = {
    key: "ExcelKalk",
    label: <span style={{ color: colorExport }}>Kalkulation (Excel)</span>,
    icon: <IconForSmallBlock color={colorExport} iconName="FileEarmarkSpreadsheet" />,
    disabled: isDirty,
  };

  const items: ItemType[] = [
    {
      key: "delete",
      label: <span style={{ color: getKonzert().kopf.confirmed ? "gray" : undefined }}>Löschen</span>,
      icon: <IconForSmallBlock color={getKonzert().kopf.confirmed ? "gray" : undefined} iconName="Trash" />,
      danger: true,
      disabled: getKonzert().kopf.confirmed,
    },
    { key: "copy", label: "Kopieren", icon: <IconForSmallBlock iconName="Files" /> },
    (isVermietung ? vermietungExport : konzertExport) as ItemType,
    { key: "history", label: "Änderungsverlauf", icon: <IconForSmallBlock iconName="GraphUp" /> },
  ];

  const onMenuClick = useCallback(
    (e: { key: string }): void => {
      switch (e.key) {
        case "ExcelKalk":
          asExcelKalkSingle({ veranstaltung: isVermietung ? getVermietung() : getKonzert(), optionen });
          break;
        case "Pressefotos":
          imgzipForVeranstaltung(getKonzert());
          break;
        case "Kassenzettel":
          openKassenzettel(getKonzert());
          break;
        case "delete":
          modal.confirm({
            type: "confirm",
            title: `${isVermietung ? "Vermietung" : "Konzert"} löschen`,
            content: `Bist Du sicher, dass Du ${isVermietung ? "die Vermietung" : "das Konzert"} "${document.title.replace("JC-", "")}" löschen möchtest?`,
            onOk: () => {
              isVermietung ? deleteVermietung.mutate(getKonzert().id!) : deleteKonzert.mutate(getVermietung().id!);
            },
          });
          break;
        case "copy":
          navigate(`/${isVermietung ? "vermietung" : "konzert"}/copy-of-${getKonzert().url}`);
          break;
        case "history":
          navigate(
            `/history?collection=${isVermietung ? "Vermietung" : "Veranstaltung"}&id=${decodeURIComponent(form.getFieldValue("id"))}`,
          );
          break;
      }
    },
    [deleteKonzert, deleteVermietung, form, getKonzert, getVermietung, isVermietung, modal, navigate, optionen],
  );

  return (
    <Dropdown menu={{ items, onClick: onMenuClick }} disabled={disabled}>
      <Button>
        <Space>
          Mehr... <IconForSmallBlock iconName="ChevronDown" />
        </Space>
      </Button>
    </Dropdown>
  );
}
