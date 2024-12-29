import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { Tag } from "antd";
import { MoreButton, ResetButton, SaveButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import { VermietungContext } from "@/components/vermietung/VermietungContext.ts";
import headerTags from "@/components/colored/headerTags.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import { useWatch } from "antd/es/form/Form";
import { FormContext } from "antd/es/form/context";

export default function VermietungPageHeader({ isNew, isDirty }: { isNew: boolean; isDirty: boolean }) {
  const { form } = useContext(FormContext);
  const { resetChanges, hasErrors } = useContext(VermietungContext);

  const [displayDate, setDisplayDate] = useState<string>("");
  const [tagsForTitle, setTagsForTitle] = useState<React.ReactElement[]>([]);

  const confirmed = useWatch(["kopf", "confirmed"], { form, preserve: true });
  const titel = useWatch(["kopf", "titel"], { form, preserve: true });
  const startDate = useWatch("startDate", { form, preserve: true });
  const brauchtPresse = useWatch("brauchtPresse", { form, preserve: true });
  const technikOK = useWatch(["technik", "checked"], { form, preserve: true });
  const presseOK = useWatch(["presse", "checked"], { form, preserve: true });
  const homepage = useWatch(["kopf", "kannAufHomePage"], { form, preserve: true });
  const social = useWatch(["kopf", "kannInSocialMedia"], { form, preserve: true });
  const brauchtTechnik = useWatch("brauchtTechnik", { form, preserve: true });
  const bar = useWatch("brauchtBar", { form, preserve: true });

  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const tempTitle = isNew ? "Neue oder kopierte Vermietung" : titel || "";
    setTitle(tempTitle);
    document.title = tempTitle;
    setDisplayDate(DatumUhrzeit.forJSDate(startDate).lesbareKurzform);
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
  }, [confirmed, technikOK, presseOK, homepage, social, brauchtPresse, brauchtTechnik, bar]);

  return (
    <JazzPageHeader
      title={title}
      dateString={displayDate}
      buttons={[
        <MoreButton key="more" disabled={isNew} isDirty={isDirty} isVermietung />,
        <ResetButton key="cancel" disabled={!isDirty} resetChanges={resetChanges} />,
        <SaveButton key="save" disabled={!isDirty || hasErrors} />,
        <TeamCalendar key="cal" />,
      ]}
      firstTag={
        <Tag key="verm" color="purple">
          Vermietung
        </Tag>
      }
      tags={tagsForTitle}
      hasErrors={hasErrors}
    />
  );
}
