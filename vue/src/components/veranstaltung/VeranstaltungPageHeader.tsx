import * as React from "react";
import { useEffect, useState } from "react";
import { Form, Tag, theme } from "antd";
import { useParams } from "react-router-dom";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import { CopyButton, DeleteButton, SaveButton } from "@/components/colored/JazzButtons";
import { PageHeader } from "@ant-design/pro-layout";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";

export default function VeranstaltungPageHeader({ isNew, dirty }: { isNew: boolean; dirty: boolean }) {
  const { url } = useParams();

  const { useToken } = theme;
  const { token } = useToken();
  const [typeColor, setTypeColor] = useState<string>("");

  const [displayDate, setDisplayDate] = useState<string>("");

  const confirmed = Form.useWatch(["kopf", "confirmed"]);
  const abgesagt = Form.useWatch(["kopf", "abgesagt"]);
  const eventTyp = Form.useWatch(["kopf", "eventTyp"]);
  const titel = Form.useWatch(["kopf", "titel"]);
  const startDate = Form.useWatch(["startAndEnd", "start"]);

  useEffect(() => {
    const tags = [];
    if (!confirmed) {
      tags.push(
        <Tag key="unbestaetigt" color={"error"}>
          Unbestätigt
        </Tag>
      );
    } else {
      tags.push(
        <Tag key="bestaetigt" color={"success"}>
          Bestätigt
        </Tag>
      );
    }
    if (abgesagt) {
      tags.push(
        <Tag key="abgesagt" color={"error"}>
          ABGESAGT
        </Tag>
      );
    }
    setTagsForTitle(tags);

    const code = `custom-color-${fieldHelpers.cssColorCode(eventTyp)}`;
    setTypeColor((token as any)[code]);

    document.title = isNew ? "Neue oder kopierte Veranstaltung" : titel;

    setDisplayDate(DatumUhrzeit.forJSDate(startDate?.toDate()).lesbareKurzform);
  }, [confirmed, abgesagt, eventTyp, titel, startDate]);

  const [tagsForTitle, setTagsForTitle] = useState<any[]>([]);

  return (
    <PageHeader
      title={<span style={{ color: typeColor }}>{document.title}</span>}
      subTitle={<span style={{ color: typeColor }}>{displayDate}</span>}
      extra={[
        <DeleteButton key="delete" disabled={isNew || confirmed} />,
        <CopyButton key="copy" disabled={isNew} url={url} />,
        <SaveButton key="save" disabled={!dirty} />,
      ]}
      tags={tagsForTitle}
    >
      {isNew && <b style={{ color: token["custom-color-ausgaben"] }}> (Denk daran, alle Felder zu überprüfen und auszufüllen)</b>}
    </PageHeader>
  );
}
