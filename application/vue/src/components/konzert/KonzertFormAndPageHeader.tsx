import * as React from "react";
import { CSSProperties, PropsWithChildren, useContext, useMemo } from "react";
import { useSearchParams } from "react-router";
import { HelpWithKasseButton, MoreButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import headerTags from "@/components/colored/headerTags.tsx";
import groupBy from "lodash/groupBy";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import { colorDefault } from "jc-shared/optionen/optionValues.ts";
import { useForm, useWatch } from "antd/es/form/Form";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";
import JazzFormAndHeaderExtended from "@/components/content/JazzFormAndHeaderExtended.tsx";
import { Tag } from "antd";
import useFormInstance from "antd/es/form/hooks/useFormInstance";

function useTags() {
  const form = useFormInstance();
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

export default function KonzertFormAndPageHeader<T>({
  data,
  saveForm,
  resetChanges,
  children,
}: PropsWithChildren<{
  data?: Partial<T>;
  saveForm: (vals: T) => void;
  resetChanges?: () => void;
}>) {
  document.title = "Konzert";
  const [form] = useForm();
  const { setKasseHelpOpen } = useContext(KonzertContext);
  const { optionen, currentUser, isDirty } = useJazzContext();
  const [search] = useSearchParams();

  const isKassenseite = useMemo(() => search.get("page") === "kasse", [search]);

  const startDate = useWatch("startDate", { form, preserve: true });
  const titel = useWatch(["kopf", "titel"], { form, preserve: true });
  const eventTyp = useWatch(["kopf", "eventTyp"], { form, preserve: true });
  const abgesagt = useWatch(["kopf", "abgesagt"], { form, preserve: true });
  const id = useWatch(["id"], { form, preserve: true });

  const displayDate = useMemo(() => DatumUhrzeit.forJSDate(startDate).lesbareKurzform, [startDate]);
  const title = useMemo(() => {
    return `${titel ?? ""}${!id ? " (NEU)" : ""}`;
  }, [id, titel]);

  const titleStyle: CSSProperties = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus || [], "name");
    const typeColor = typByName[eventTyp]?.[0].color ?? colorDefault;
    return { color: typeColor, textDecoration: abgesagt ? "line-through" : "" };
  }, [abgesagt, eventTyp, optionen?.typenPlus]);

  const isOrga = useMemo(() => currentUser.accessrights.isOrgaTeam, [currentUser.accessrights.isOrgaTeam]);

  const tagsForTitle = useTags();
  return (
    <JazzFormAndHeaderExtended
      title={title}
      styledTitle={<span style={titleStyle}>{title}</span>}
      saveForm={saveForm}
      data={data}
      dateString={displayDate}
      resetChanges={resetChanges}
      additionalButtons={[isOrga && <MoreButton key="more" disabled={!id} isDirty={isDirty} />]}
      additionalButtonsLast={[
        isKassenseite && <HelpWithKasseButton key="helpKasse" callback={() => setKasseHelpOpen(true)} />,
        <TeamCalendar key="cal" />,
      ]}
      firstTag={
        <Tag key="verm" color="purple">
          Vermietung
        </Tag>
      }
      tags={tagsForTitle}
      changedPropsToWatch={[["kasse", "kassenfreigabe"], "agenturauswahl"]}
      form={form}
    >
      {children}
    </JazzFormAndHeaderExtended>
  );
}
