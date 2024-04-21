import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { Form, Tag } from "antd";
import { MoreButton, SaveButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import headerTags from "@/components/colored/headerTags.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";

export default function VermietungPageHeader({ isNew, dirty }: { isNew: boolean; dirty: boolean }) {
  const context = useContext(VermietungContext);
  const form = context!.form;

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

  const bar = Form.useWatch("brauchtBar", {
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
    taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social }, { label: "Bar einladen", color: bar });
    setTagsForTitle(headerTags(taggies));
  }, [confirmed, brauchtTechnik, brauchtPresse, technikOK, presseOK, homepage, social, bar]);

  const [tagsForTitle, setTagsForTitle] = useState<React.ReactElement[]>([]);

  return (
    <JazzPageHeader
      title={title}
      buttons={[<MoreButton key="more" />, <SaveButton key="save" disabled={!dirty} />, <TeamCalendar key="cal" />]}
      firstTag={
        <Tag key="verm" color="purple">
          Vermietung
        </Tag>
      }
      dateString={displayDate}
      tags={tagsForTitle}
    >
      {isNew && (
        <b
          style={{
            color: "#d50f36",
          }}
        >
          {" "}
          (Denk daran, alle Felder zu überprüfen und auszufüllen)
        </b>
      )}
    </JazzPageHeader>
  );
}
