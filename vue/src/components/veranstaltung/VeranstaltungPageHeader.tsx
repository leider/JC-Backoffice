import * as React from "react";
import { CSSProperties, useEffect, useState } from "react";
import { Form, FormInstance, Tag, theme } from "antd";
import { useParams } from "react-router-dom";
import fieldHelpers from "jc-shared/commons/fieldHelpers";
import { CopyButton, DeleteButton, ExportButtons, SaveButton } from "@/components/colored/JazzButtons";
import { PageHeader } from "@ant-design/pro-layout";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import { useAuth } from "@/commons/auth.tsx";

export default function VeranstaltungPageHeader({
  veranstaltung,
  isNew,
  dirty,
  form,
}: {
  veranstaltung: Veranstaltung;
  isNew: boolean;
  dirty: boolean;
  form: FormInstance<Veranstaltung>;
}) {
  const { url } = useParams();

  const { context } = useAuth();
  const { useToken } = theme;
  const { token } = useToken();
  const [typeColor, setTypeColor] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");
  const [tagsForTitle, setTagsForTitle] = useState<any[]>([]);

  const [isOrga, setIsOrga] = useState<boolean>(false);

  const eventTyp = Form.useWatch(["kopf", "eventTyp"], {
    form,
    preserve: true,
  });
  const titel = Form.useWatch(["kopf", "titel"], { form, preserve: true });
  const startDate = Form.useWatch(["startAndEnd", "start"], {
    form,
    preserve: true,
  });
  const confirmed = Form.useWatch(["kopf", "confirmed"], {
    form,
    preserve: true,
  });
  const abgesagt = Form.useWatch(["kopf", "abgesagt"], {
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

  useEffect(() => {
    const code = `custom-color-${fieldHelpers.cssColorCode(eventTyp)}`;
    setTypeColor((token as any)[code]);
    document.title = isNew ? "Neue oder kopierte Veranstaltung" : titel;
    setDisplayDate(DatumUhrzeit.forJSDate(startDate?.toDate()).lesbareKurzform);
  }, [isNew, token, eventTyp, titel, startDate]);

  useEffect(() => {
    function HeaderTag({ label, color }: { label: string; color: string }) {
      return (
        <Tag key={label} color={color}>
          {label}
        </Tag>
      );
    }
    const taggies: { label: string; color: string }[] = [
      { label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed ? "success" : "error" },
      { label: "Technik", color: technikOK ? "success" : "error" },
      { label: "Presse", color: presseOK ? "success" : "error" },
      { label: "Homepage", color: homepage ? "success" : "error" },
      { label: "Social Media", color: social ? "success" : "error" },
    ];
    if (abgesagt) {
      taggies.unshift({ label: "ABGESAGT", color: "error" });
    }
    setTagsForTitle(taggies.map((tag) => <HeaderTag label={tag.label} color={tag.color}></HeaderTag>));
  }, [confirmed, abgesagt, technikOK, presseOK, homepage, social]);

  useEffect(() => {
    setIsOrga(context?.currentUser?.accessrights?.isOrgaTeam || false);
  }, [context, setIsOrga]);

  const titleStyle: CSSProperties = { color: typeColor, whiteSpace: "normal" };
  return (
    <PageHeader
      title={<span style={titleStyle}>{document.title}</span>}
      subTitle={<span style={titleStyle}>{displayDate}</span>}
      extra={[
        isOrga && <ExportButtons key="exports" disabled={isNew} veranstaltung={veranstaltung} />,
        isOrga && <DeleteButton key="delete" disabled={isNew || confirmed} id={form.getFieldValue("id")} />,
        isOrga && <CopyButton key="copy" disabled={isNew} url={url} />,
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
          (Denk daran, alle Felder zu überprüfen und auszufüllen)
        </b>
      )}
    </PageHeader>
  );
}
