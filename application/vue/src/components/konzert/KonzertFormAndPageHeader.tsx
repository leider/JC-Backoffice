import * as React from "react";
import { CSSProperties, PropsWithChildren, useCallback, useContext, useMemo } from "react";
import { useSearchParams } from "react-router";
import { HelpWithKasseButton, MoreButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import groupBy from "lodash/groupBy";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import { colorDefault } from "jc-shared/optionen/optionValues.ts";
import { useForm, useWatch } from "antd/es/form/Form";
import { KonzertContext } from "@/components/konzert/KonzertContext.ts";
import JazzFormAndHeaderExtended from "@/components/content/JazzFormAndHeaderExtended.tsx";
import dynamicHeaderTags from "@/components/colored/dynamicHeaderTags.tsx";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";

export default function KonzertFormAndPageHeader({
  data,
  saveForm,
  resetChanges,
  children,
}: PropsWithChildren<{
  readonly data?: Partial<KonzertWithRiderBoxes>;
  readonly saveForm: (vals: KonzertWithRiderBoxes) => void;
  readonly resetChanges?: () => Promise<unknown>;
}>) {
  document.title = "Konzert";
  const [form] = useForm<KonzertWithRiderBoxes>();
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

  const titleStyle: CSSProperties = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus ?? [], "name");
    const typeColor = typByName[eventTyp]?.[0].color ?? colorDefault;
    return { color: typeColor, textDecoration: abgesagt ? "line-through" : "" };
  }, [abgesagt, eventTyp, optionen?.typenPlus]);

  const isOrga = useMemo(() => currentUser.accessrights.isOrgaTeam, [currentUser.accessrights.isOrgaTeam]);

  const tagsForTitle = useMemo(
    () =>
      dynamicHeaderTags([
        { label: "ABGESAGT", dependsOn: ["kopf", "abgesagt"], path: ["kopf", "abgesagt"], invertColor: true },
        { label: "Bestätigt", labelNotOk: "Unbestätigt", path: ["kopf", "confirmed"] },
        { label: "Technik", path: ["technik", "checked"] },
        { label: "Presse", dependsOn: "brauchtPresse", path: ["presse", "checked"] },
        { label: "Homepage", path: ["kopf", "kannAufHomePage"] },
        { label: "Social Media", path: ["kopf", "kannInSocialMedia"] },
        { label: "Hotel", dependsOn: ["artist", "brauchtHotel"], path: ["unterkunft", "bestaetigt"] },
      ]),
    [],
  );

  const openKasseHelp = useCallback(() => setKasseHelpOpen(true), [setKasseHelpOpen]);

  return (
    <JazzFormAndHeaderExtended<KonzertWithRiderBoxes>
      additionalButtons={[isOrga && <MoreButton disabled={!id} isDirty={isDirty} key="more" />]}
      additionalButtonsLast={[
        isKassenseite && <HelpWithKasseButton callback={openKasseHelp} key="helpKasse" />,
        <TeamCalendar key="cal" />,
      ]}
      data={data}
      dateString={displayDate}
      form={form}
      resetChanges={resetChanges}
      saveForm={saveForm}
      style={titleStyle}
      tags={tagsForTitle}
      title={titel}
    >
      {children}
    </JazzFormAndHeaderExtended>
  );
}
