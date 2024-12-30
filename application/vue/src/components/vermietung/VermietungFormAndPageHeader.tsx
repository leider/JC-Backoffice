import * as React from "react";
import { PropsWithChildren, useContext, useMemo } from "react";
import { Tag } from "antd";
import { MoreButton } from "@/components/colored/JazzButtons";
import DatumUhrzeit from "jc-shared/commons/DatumUhrzeit";
import headerTags from "@/components/colored/headerTags.tsx";
import TeamCalendar from "@/components/team/TeamCalendar.tsx";
import { useForm, useWatch } from "antd/es/form/Form";
import { FormContext } from "antd/es/form/context";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import JazzFormAndHeaderExtended from "@/components/content/JazzFormAndHeaderExtended.tsx";

function useTags() {
  const { form } = useContext(FormContext);
  const confirmed = useWatch(["kopf", "confirmed"], { form, preserve: true });
  const brauchtPresse = useWatch("brauchtPresse", { form, preserve: true });
  const technikOK = useWatch(["technik", "checked"], { form, preserve: true });
  const presseOK = useWatch(["presse", "checked"], { form, preserve: true });
  const homepage = useWatch(["kopf", "kannAufHomePage"], { form, preserve: true });
  const social = useWatch(["kopf", "kannInSocialMedia"], { form, preserve: true });
  const brauchtTechnik = useWatch("brauchtTechnik", { form, preserve: true });
  const bar = useWatch("brauchtBar", { form, preserve: true });

  const taggies = [{ label: confirmed ? "Bestätigt" : "Unbestätigt", color: !!confirmed }];
  if (brauchtTechnik) {
    taggies.push({ label: "Technik", color: technikOK });
  }
  if (brauchtPresse) {
    taggies.push({ label: "Presse", color: presseOK });
  }
  taggies.push({ label: "Homepage", color: homepage }, { label: "Social Media", color: social }, { label: "Bar einladen", color: bar });
  return headerTags(taggies);
}

export default function VermietungFormAndPageHeader<T>({
  data,
  saveForm,
  resetChanges,
  children,
}: PropsWithChildren<{
  data?: Partial<T>;
  saveForm: (vals: T) => void;
  resetChanges?: () => void;
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
