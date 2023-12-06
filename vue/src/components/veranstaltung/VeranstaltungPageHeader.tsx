import * as React from "react";
import { CSSProperties, useContext, useEffect, useState } from "react";
import { Form } from "antd";
import { useParams } from "react-router-dom";
import { CopyButton, DeleteButton, ExportButtons, SaveButton } from "@/components/colored/JazzButtons";
import { PageHeader } from "@ant-design/pro-layout";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { useAuth } from "@/commons/authConsts.ts";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import headerTags from "@/components/colored/headerTags.tsx";
import { useTypeCustomColors } from "@/components/createTokenBasedStyles.ts";

export default function VeranstaltungPageHeader({ isNew, dirty }: { isNew: boolean; dirty: boolean }) {
  const veranstContext = useContext(VeranstaltungContext);
  const form = veranstContext!.form;
  const { url } = useParams();

  const { context } = useAuth();
  const [typeColor, setTypeColor] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");
  const [tagsForTitle, setTagsForTitle] = useState<React.ReactElement[]>([]);

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
  const brauchtHotel = Form.useWatch(["artist", "brauchtHotel"], {
    form,
    preserve: true,
  });
  const hotel = Form.useWatch(["unterkunft", "bestaetigt"], {
    form,
    preserve: true,
  });

  const [title, setTitle] = useState<string>("");
  const { colorForEventTyp, typeColors } = useTypeCustomColors();

  useEffect(() => {
    setTypeColor(colorForEventTyp(eventTyp));
    const tempTitle = isNew ? "Neue oder kopierte Veranstaltung" : titel || "";
    setTitle(tempTitle);
    document.title = tempTitle;
    setDisplayDate(DatumUhrzeit.forJSDate(startDate?.toDate()).lesbareKurzform);
  }, [isNew, eventTyp, titel, startDate, colorForEventTyp]);

  useEffect(() => {
    const taggies: { label: string; color: boolean }[] = [
      { label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed },
      { label: "Technik", color: technikOK },
      { label: "Presse", color: presseOK },
      { label: "Homepage", color: homepage },
      { label: "Social Media", color: social },
    ];
    if (abgesagt) {
      taggies.unshift({ label: "ABGESAGT", color: false });
    }
    if (brauchtHotel) {
      taggies.push({ label: "Hotel", color: hotel });
    }
    setTagsForTitle(headerTags(taggies));
  }, [confirmed, abgesagt, technikOK, presseOK, homepage, social, brauchtHotel, hotel]);

  useEffect(() => {
    setIsOrga(context?.currentUser?.accessrights?.isOrgaTeam || false);
  }, [context, setIsOrga]);

  const titleStyle: CSSProperties = { color: typeColor, whiteSpace: "normal" };
  return (
    <PageHeader
      title={<span style={titleStyle}>{title}</span>}
      subTitle={<span style={titleStyle}>{displayDate}</span>}
      extra={[
        isOrga && <ExportButtons key="exports" disabled={isNew} />,
        isOrga && <DeleteButton key="delete" disabled={isNew || confirmed} id={form.getFieldValue("id")} />,
        isOrga && <CopyButton key="copy" disabled={isNew} url={url} />,
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
          (Denk daran, alle Felder zu überprüfen und auszufüllen)
        </b>
      )}
    </PageHeader>
  );
}
