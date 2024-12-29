import * as React from "react";
import { CSSProperties, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { HelpWithKasseButton, MoreButton, ResetButton, SaveButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import headerTags from "@/components/colored/headerTags.tsx";
import groupBy from "lodash/groupBy";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import { colorDefault } from "jc-shared/optionen/optionValues.ts";
import { useWatch } from "antd/es/form/Form";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";
import { FormContext } from "antd/es/form/context";

export default function KonzertPageHeader({ isNew }: { isNew: boolean }) {
  const { form } = useContext(FormContext);
  const { resetChanges, setKasseHelpOpen, isDirty, hasErrors } = useContext(KonzertContext);
  const { optionen } = useJazzContext();
  const [search] = useSearchParams();
  const { currentUser } = useJazzContext();
  const [displayDate, setDisplayDate] = useState<string>("");
  const [tagsForTitle, setTagsForTitle] = useState<React.ReactElement[]>([]);

  const isKassenseite = useMemo(() => search.get("page") === "kasse", [search]);
  const eventTyp = useWatch(["kopf", "eventTyp"], { form, preserve: true });

  const confirmed = useWatch(["kopf", "confirmed"], { form, preserve: true });
  const titel = useWatch(["kopf", "titel"], { form, preserve: true });
  const startDate = useWatch("startDate", { form, preserve: true });
  const brauchtPresse = useWatch("brauchtPresse", { form, preserve: true });
  const technikOK = useWatch(["technik", "checked"], { form, preserve: true });
  const presseOK = useWatch(["presse", "checked"], { form, preserve: true });
  const homepage = useWatch(["kopf", "kannAufHomePage"], { form, preserve: true });
  const social = useWatch(["kopf", "kannInSocialMedia"], { form, preserve: true });
  const abgesagt = useWatch(["kopf", "abgesagt"], { form, preserve: true });
  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { form, preserve: true });
  const hotel = useWatch(["unterkunft", "bestaetigt"], { form, preserve: true });

  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    const tempTitle = isNew ? "Neue oder kopierte Veranstaltung" : titel || "";
    setTitle(tempTitle);
    document.title = tempTitle;
    setDisplayDate(DatumUhrzeit.forJSDate(startDate).lesbareKurzform);
  }, [titel, startDate, isNew, eventTyp]);

  useEffect(() => {
    const taggies: { label: string; color: boolean }[] = [
      { label: confirmed ? "Bestätigt" : "Unbestätigt", color: confirmed },
      { label: "Technik", color: technikOK },
    ];
    if (brauchtPresse) {
      taggies.push({ label: "Presse", color: presseOK });
    }
    taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social });
    if (abgesagt) {
      taggies.unshift({ label: "ABGESAGT", color: false });
    }
    if (brauchtHotel) {
      taggies.push({ label: "Hotel", color: hotel });
    }
    setTagsForTitle(headerTags(taggies));
  }, [confirmed, technikOK, presseOK, homepage, social, brauchtPresse, abgesagt, brauchtHotel, hotel]);

  const typeColor = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus || [], "name");
    return typByName[eventTyp]?.[0].color ?? colorDefault;
  }, [optionen, eventTyp]);
  const titleStyle: CSSProperties = { color: typeColor, textDecoration: abgesagt ? "line-through" : "" };

  const isOrga = useMemo(() => currentUser.accessrights.isOrgaTeam, [currentUser.accessrights.isOrgaTeam]);

  return (
    <JazzPageHeader
      title={<span style={titleStyle}>{title}</span>}
      dateString={displayDate}
      buttons={[
        isOrga && <MoreButton key="more" disabled={isNew} isDirty={isDirty} />,
        <ResetButton key="cancel" disabled={!isDirty} resetChanges={resetChanges} />,
        <SaveButton key="save" disabled={!isDirty || hasErrors} />,
        isKassenseite && <HelpWithKasseButton key="helpKasse" callback={() => setKasseHelpOpen(true)} />,
        <TeamCalendar key="cal" />,
      ]}
      tags={tagsForTitle}
      hasErrors={hasErrors}
    />
  );
}
