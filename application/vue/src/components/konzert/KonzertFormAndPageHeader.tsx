import * as React from "react";
import { CSSProperties, PropsWithChildren, useContext, useMemo } from "react";
import { useLocation, useSearchParams } from "react-router";
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

export default function KonzertFormAndPageHeader<T>({
  data,
  saveForm,
  resetChanges,
  children,
}: PropsWithChildren<{
  data?: Partial<T>;
  saveForm: (vals: T) => void;
  resetChanges?: () => Promise<unknown>;
}>) {
  document.title = "Konzert";
  const [form] = useForm();
  const { setKasseHelpOpen } = useContext(KonzertContext);
  const { optionen, currentUser, isDirty } = useJazzContext();
  const [search] = useSearchParams();

  const { pathname } = useLocation();
  const isCopy = useMemo(() => {
    return pathname.includes("/copy-of-");
  }, [pathname]);
  const isNew = useMemo(() => {
    return pathname.includes("/new");
  }, [pathname]);

  const isKassenseite = useMemo(() => search.get("page") === "kasse", [search]);

  const startDate = useWatch("startDate", { form, preserve: true });
  const titel = useWatch(["kopf", "titel"], { form, preserve: true });
  const eventTyp = useWatch(["kopf", "eventTyp"], { form, preserve: true });
  const abgesagt = useWatch(["kopf", "abgesagt"], { form, preserve: true });
  const id = useWatch(["id"], { form, preserve: true });

  const displayDate = useMemo(() => DatumUhrzeit.forJSDate(startDate).lesbareKurzform, [startDate]);
  const title = useMemo(() => {
    return `${titel ?? ""}${isNew ? " (Neu)" : ""}${isCopy ? " (Kopie)" : ""}`;
  }, [isCopy, isNew, titel]);

  const titleStyle: CSSProperties = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus || [], "name");
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

  return (
    <JazzFormAndHeaderExtended
      title={title}
      style={titleStyle}
      saveForm={saveForm}
      data={data}
      dateString={displayDate}
      resetChanges={resetChanges}
      additionalButtons={[isOrga && <MoreButton key="more" disabled={!id} isDirty={isDirty} />]}
      additionalButtonsLast={[
        isKassenseite && <HelpWithKasseButton key="helpKasse" callback={() => setKasseHelpOpen(true)} />,
        <TeamCalendar key="cal" />,
      ]}
      tags={tagsForTitle}
      changedPropsToWatch={[["kasse", "kassenfreigabe"], "agenturauswahl"]}
      form={form}
    >
      {children}
    </JazzFormAndHeaderExtended>
  );
}
