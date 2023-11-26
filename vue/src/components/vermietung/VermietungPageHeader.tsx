import * as React from "react";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { Form, theme } from "antd";
import { useParams } from "react-router-dom";
import { CopyButton, DeleteButton, ExportExcelVermietungButton, SaveButton } from "@/components/colored/JazzButtons";
import { PageHeader } from "@ant-design/pro-layout";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import headerTags from "@/components/colored/headerTags.tsx";
import { useTypeCustomColors } from "@/components/createTokenBasedStyles.ts";

export default function VermietungPageHeader({ isNew, dirty }: { isNew: boolean; dirty: boolean }) {
  const context = useContext(VermietungContext);
  const form = context!.form;

  const { url } = useParams();

  const { useToken } = theme;
  const { token } = useToken();
  const { typeColors } = useTypeCustomColors();
  const [displayDate, setDisplayDate] = useState<string>("");

  const confirmed = Form.useWatch(["kopf", "confirmed"], {
    form,
    preserve: true,
  });
  const titel = Form.useWatch(["kopf", "titel"], { form, preserve: true });
  const startDate = Form.useWatch(["startAndEnd", "start"], {
    form,
    preserve: true,
  });
  const brauchtTechnik = Form.useWatch("brauchtTechnik", {
    form,
    preserve: true,
  });
  const brauchtPresse = Form.useWatch("brauchtPresse", {
    form,
    preserve: true,
  });
  const technikOK = Form.useWatch(["technik", "checked"], {
    form,
    preserve: true,
  });
  const presseOK = Form.useWatch(["presse", "checked"], {
    form,
    preserve: true,
  });
  const homepage = Form.useWatch(["kopf", "kannAufHomePage"], {
    form,
    preserve: true,
  });
  const social = Form.useWatch(["kopf", "kannInSocialMedia"], {
    form,
    preserve: true,
  });

  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const tempTitle = isNew ? "Neue oder kopierte Vermietung" : titel || "";
    setTitle(tempTitle);
    document.title = tempTitle;
    setDisplayDate(DatumUhrzeit.forJSDate(startDate?.toDate()).lesbareKurzform);
  }, [titel, startDate, isNew]);

  useEffect(() => {
    const taggies: { label: string; color: boolean }[] = [{ label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed || false }];
    if (brauchtTechnik) {
      taggies.push({ label: "Technik", color: technikOK });
    }
    if (brauchtPresse) {
      taggies.push({ label: "Presse", color: presseOK });
    }
    taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social });
    setTagsForTitle(headerTags(taggies));
  }, [confirmed, brauchtTechnik, brauchtPresse, technikOK, presseOK, homepage, social]);

  const [tagsForTitle, setTagsForTitle] = useState<JSX.Element[]>([]);

  const titleStyle: CSSProperties = { color: token.colorText, whiteSpace: "normal" };

  return (
    <PageHeader
      title={<span style={titleStyle}>Vermietung - {title}</span>}
      subTitle={<span style={titleStyle}>{displayDate}</span>}
      extra={[
        <ExportExcelVermietungButton key="excel" disabled={isNew} />,
        <DeleteButton key="delete" disabled={isNew || confirmed} id={form.getFieldValue("id")} isVermietung />,
        <CopyButton key="copy" disabled={isNew} url={url} isVermietung />,
        <SaveButton key="save" disabled={!dirty} />,
      ]}
      tags={tagsForTitle}
    >
      {isNew && (
        <b
          style={{
            color: typeColors["ausgaben"],
          }}
        >
          {" "}
          (Denk daran, alle Felder zu überprüfen und auszufüllen)
        </b>
      )}
    </PageHeader>
  );
}
