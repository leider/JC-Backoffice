import * as React from "react";
import { CSSProperties, useContext, useMemo } from "react";
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

function useTags() {
  const { form } = useContext(FormContext);
  const confirmed = useWatch(["kopf", "confirmed"], { form, preserve: true });
  const brauchtPresse = useWatch("brauchtPresse", { form, preserve: true });
  const technikOK = useWatch(["technik", "checked"], { form, preserve: true });
  const presseOK = useWatch(["presse", "checked"], { form, preserve: true });
  const homepage = useWatch(["kopf", "kannAufHomePage"], { form, preserve: true });
  const social = useWatch(["kopf", "kannInSocialMedia"], { form, preserve: true });
  const abgesagt = useWatch(["kopf", "abgesagt"], { form, preserve: true });
  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { form, preserve: true });
  const hotel = useWatch(["unterkunft", "bestaetigt"], { form, preserve: true });

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
  return headerTags(taggies);
}

export default function KonzertPageHeader({ isNew }: { isNew: boolean }) {
  document.title = "Konzert";
  const { form } = useContext(FormContext);
  const { resetChanges, setKasseHelpOpen } = useContext(KonzertContext);
  const { optionen, currentUser, isDirty, hasErrors } = useJazzContext();
  const [search] = useSearchParams();

  const isKassenseite = useMemo(() => search.get("page") === "kasse", [search]);

  const startDate = useWatch("startDate", { form, preserve: true });
  const titel = useWatch(["kopf", "titel"], { form, preserve: true });
  const eventTyp = useWatch(["kopf", "eventTyp"], { form, preserve: true });
  const abgesagt = useWatch(["kopf", "abgesagt"], { form, preserve: true });

  const displayDate = useMemo(() => DatumUhrzeit.forJSDate(startDate).lesbareKurzform, [startDate]);
  const title = useMemo(() => {
    return `${titel ?? ""}${isNew ? " (NEU)" : ""}`;
  }, [isNew, titel]);

  const typeColor = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus || [], "name");
    return typByName[eventTyp]?.[0].color ?? colorDefault;
  }, [optionen, eventTyp]);
  const titleStyle: CSSProperties = { color: typeColor, textDecoration: abgesagt ? "line-through" : "" };

  const isOrga = useMemo(() => currentUser.accessrights.isOrgaTeam, [currentUser.accessrights.isOrgaTeam]);

  const tagsForTitle = useTags();
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
