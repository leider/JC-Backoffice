import * as React from "react";
import { CSSProperties, useEffect, useState } from "react";
import { Form, FormInstance, Tag, theme } from "antd";
import { useParams } from "react-router-dom";
import { CopyButton, DeleteButton, SaveButton } from "@/components/colored/JazzButtons";
import { PageHeader } from "@ant-design/pro-layout";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

export default function VermietungPageHeader({ isNew, dirty, form }: { isNew: boolean; dirty: boolean; form: FormInstance<Vermietung> }) {
  const { url } = useParams();

  const { useToken } = theme;
  const { token } = useToken();

  const [displayDate, setDisplayDate] = useState<string>("");

  const confirmed = Form.useWatch(["kopf", "confirmed"], {
    form,
    preserve: true,
  });
  const titel = Form.useWatch(["titel"], { form, preserve: true });
  const startDate = Form.useWatch(["startAndEnd", "start"], {
    form,
    preserve: true,
  });

  function updateState() {
    const tags = [];
    if (!confirmed) {
      tags.push(
        <Tag key="unbestaetigt" color={"error"}>
          Unbestätigt
        </Tag>,
      );
    } else {
      tags.push(
        <Tag key="bestaetigt" color={"success"}>
          Bestätigt
        </Tag>,
      );
    }
    setTagsForTitle(tags);

    document.title = isNew ? "Neue oder kopierte Vermietung" : titel;

    setDisplayDate(DatumUhrzeit.forJSDate(startDate?.toDate()).lesbareKurzform);
  }
  useEffect(updateState, [confirmed, titel, startDate, isNew]);

  const [tagsForTitle, setTagsForTitle] = useState<any[]>([]);

  const titleStyle: CSSProperties = { color: token.colorPrimary, whiteSpace: "normal" };
  return (
    <PageHeader
      title={<span style={titleStyle}>{document.title}</span>}
      subTitle={<span style={titleStyle}>{displayDate}</span>}
      extra={[
        <DeleteButton key="delete" disabled={isNew || confirmed} id={form.getFieldValue("id")} isVermietung />,
        <CopyButton key="copy" disabled={isNew} url={url} isVermietung />,
        <SaveButton key="save" disabled={!dirty} />,
      ]}
      tags={tagsForTitle}
    >
      {isNew && (
        <b
          style={{
            color: (token as any)["custom-color-ausgaben"],
          }}
        >
          {" "}
          (Denk daran, alle Felder zu überprüfen und auszufüllen)
        </b>
      )}
    </PageHeader>
  );
}
