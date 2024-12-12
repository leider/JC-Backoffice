import { App, Button, Dropdown, Form, Modal, Space, theme } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import * as React from "react";
import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { deleteKonzertWithId, deleteVermietungWithId, imgzipForVeranstaltung, openKassenzettel } from "@/commons/loader.ts";
import { VermietungContext } from "@/components/vermietung/VermietungContext.ts";
import { asExcelKalk } from "@/commons/utilityFunctions.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";
import Konzert from "jc-shared/konzert/konzert.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import isNil from "lodash/isNil";
import { Changelog } from "@/components/history/Changelog.tsx";
import { ItemType } from "antd/es/menu/interface";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";

type ButtonProps = {
  disabled?: boolean;
};
function SaveOrSendButton({ disabled, isSend }: ButtonProps & { isSend: boolean }) {
  const token = theme.useToken().token;

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

export function HelpWithKasseButton({ callback }: { callback: () => void }) {
  const token = theme.useToken().token;

  return <ButtonWithIcon alwaysText text="Abendkasse Hilfe" onClick={callback} icon="QuestionCircleFill" color={token.colorSuccess} />;
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

export function MoreButton({ disabled }: ButtonProps) {
  const konzertContext = useContext(KonzertContext);
  const vermietungKontext = useContext(VermietungContext);
  const { form, isDirty } = useMemo(() => konzertContext ?? vermietungKontext, [konzertContext, vermietungKontext]);
  const isVermietung = useMemo(() => isNil(konzertContext), [konzertContext]);
  function getKonzert() {
    return new Konzert(form.getFieldsValue(true));
  }

  function getVermietung() {
    return new Vermietung(form.getFieldsValue(true));
  }

  const { modal } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showHistory, setShowHistory] = useState(false);

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

  function colorExport() {
    return isDirty ? "rgba(89,0,185,0.43)" : "#5900b9";
  }

  const konzertExport = {
    type: "group",
    key: "export",
    label: <span style={{ color: colorExport() }}>Exportieren</span>,
    children: [
      {
        key: "ExcelKalk",
        label: <span style={{ color: colorExport() }}>Kalkulation (Excel)</span>,
        icon: <IconForSmallBlock color={colorExport()} iconName="FileEarmarkSpreadsheet" />,
        disabled: isDirty,
      },
      {
        key: "Pressefotos",
        label: <span style={{ color: colorExport() }}>Pressefotos (Zip)</span>,
        icon: <IconForSmallBlock color={colorExport()} iconName="FileEarmarkImage" />,
        disabled: isDirty,
      },
      {
        key: "Kassenzettel",
        label: <span style={{ color: colorExport() }}>Kassenzettel (Pdf)</span>,
        icon: <IconForSmallBlock color={colorExport()} iconName="Printer" />,
        disabled: isDirty,
      },
    ],
  };

  const vermietungExport = {
    key: "ExcelKalk",
    label: <span style={{ color: colorExport() }}>Kalkulation (Excel)</span>,
    icon: <IconForSmallBlock color={colorExport()} iconName="FileEarmarkSpreadsheet" />,
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

  function onMenuClick(e: { key: string }): void {
    const konzert = getKonzert();
    const vermietung = getVermietung();
    if (e.key === "ExcelKalk") {
      asExcelKalk([isVermietung ? vermietung : konzert]);
    }
    if (e.key === "Pressefotos") {
      imgzipForVeranstaltung(konzert);
    }
    if (e.key === "Kassenzettel") {
      openKassenzettel(konzert);
    }
    if (e.key === "delete") {
      modal.confirm({
        type: "confirm",
        title: `${isVermietung ? "Vermietung" : "Konzert"} löschen`,
        content: `Bist Du sicher, dass Du ${isVermietung ? "die Vermietung" : "das Konzert"} "${document.title}" löschen möchtest?`,
        onOk: () => {
          isVermietung ? deleteVermietung.mutate(konzert.id!) : deleteKonzert.mutate(vermietung.id!);
        },
      });
    }
    if (e.key === "copy") {
      navigate(`/${isVermietung ? "vermietung" : "konzert"}/copy-of-${konzert.url}`);
    }
    if (e.key === "history") {
      setShowHistory(true);
    }
  }

  return (
    <>
      <Modal width="90%" open={showHistory} onCancel={() => setShowHistory(false)} footer={null}>
        <Form.Item name="id" valuePropName="id">
          <Changelog collection={isVermietung ? "Vermietung" : "Veranstaltung"} />
        </Form.Item>
      </Modal>

      <Dropdown menu={{ items, onClick: onMenuClick }} disabled={disabled}>
        <Button>
          <Space>
            Mehr... <IconForSmallBlock iconName="ChevronDown" />
          </Space>
        </Button>
      </Dropdown>
    </>
  );
}
