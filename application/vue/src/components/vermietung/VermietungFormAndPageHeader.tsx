import * as React from "react";
import { PropsWithChildren, useMemo } from "react";
import { Tag } from "antd";
import { MoreButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import { useForm, useWatch } from "antd/es/form/Form";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import JazzFormAndHeaderExtended from "@/components/content/JazzFormAndHeaderExtended.tsx";
import dynamicHeaderTags from "../colored/dynamicHeaderTags.tsx";

function useTags() {
  return dynamicHeaderTags([
    { label: "Bestätigt", labelNotOk: "Unbestätigt", path: ["kopf", "confirmed"] },
    { label: "Technik", dependsOn: "brauchtTechnik", path: ["technik", "checked"] },
    { label: "Presse", dependsOn: "brauchtPresse", path: ["presse", "checked"] },
    { label: "Homepage", path: ["kopf", "kannAufHomePage"] },
    { label: "Social Media", path: ["kopf", "kannInSocialMedia"] },
    { label: "Bar einladen", path: "brauchtBar" },
  ]);
}

export default function VermietungFormAndPageHeader<T>({
  data,
  saveForm,
  resetChanges,
  children,
}: PropsWithChildren<{
  data?: Partial<T>;
  saveForm: (vals: T) => void;
  resetChanges?: () => Promise<unknown>;
}>) {
  document.title = "Vermietung";
  const [form] = useForm();
  const { isDirty } = useJazzContext();

  const id = useWatch("id", { form, preserve: true });
  const startDate = useWatch("startDate", { form, preserve: true });
  const titel = useWatch(["kopf", "titel"], { form, preserve: true });
  const displayDate = useMemo(() => DatumUhrzeit.forJSDate(startDate).lesbareKurzform, [startDate]);
  const title = useMemo(() => {
    return `${titel ?? ""}${!id ? " (NEU)" : ""}`;
  }, [id, titel]);

  const tagsForTitle = useTags();

  return (
    <JazzFormAndHeaderExtended
      title={title}
      saveForm={saveForm}
      data={data}
      dateString={displayDate}
      resetChanges={resetChanges}
      additionalButtons={[<MoreButton key="more" disabled={!id} isDirty={isDirty} isVermietung />]}
      additionalButtonsLast={[<TeamCalendar key="cal" />]}
      firstTag={
        <Tag key="verm" color="purple">
          Vermietung
        </Tag>
      }
      tags={tagsForTitle}
      changedPropsToWatch={[["angebot", "freigabe"]]}
      form={form}
    >
      {children}
    </JazzFormAndHeaderExtended>
  );
}
