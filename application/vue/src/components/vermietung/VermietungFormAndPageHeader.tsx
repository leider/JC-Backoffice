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
import { useLocation } from "react-router";

export default function VermietungFormAndPageHeader<T>({
  data,
  saveForm,
  resetChanges,
  children,
}: PropsWithChildren<{
  readonly data?: Partial<T>;
  readonly saveForm: (vals: T) => void;
  readonly resetChanges?: () => Promise<unknown>;
}>) {
  document.title = "Vermietung";
  const [form] = useForm();
  const { isDirty } = useJazzContext();
  const { pathname } = useLocation();
  const isCopy = useMemo(() => {
    return pathname.includes("/copy-of-");
  }, [pathname]);
  const isNew = useMemo(() => {
    return pathname.includes("/new");
  }, [pathname]);

  const id = useWatch("id", { form, preserve: true });
  const startDate = useWatch("startDate", { form, preserve: true });
  const titel = useWatch(["kopf", "titel"], { form, preserve: true });
  const displayDate = useMemo(() => DatumUhrzeit.forJSDate(startDate).lesbareKurzform, [startDate]);
  const title = useMemo(() => {
    return `${titel ?? ""}${isNew ? " (Neu)" : ""}${isCopy ? " (Kopie)" : ""}`;
  }, [isCopy, isNew, titel]);

  const tagsForTitle = useMemo(
    () =>
      dynamicHeaderTags([
        { label: "Bestätigt", labelNotOk: "Unbestätigt", path: ["kopf", "confirmed"] },
        { label: "Technik", dependsOn: "brauchtTechnik", path: ["technik", "checked"] },
        { label: "Presse", dependsOn: "brauchtPresse", path: ["presse", "checked"] },
        { label: "Homepage", path: ["kopf", "kannAufHomePage"] },
        { label: "Social Media", path: ["kopf", "kannInSocialMedia"] },
        { label: "Bar einladen", path: "brauchtBar" },
      ]),
    [],
  );

  return (
    <JazzFormAndHeaderExtended
      additionalButtons={[<MoreButton disabled={!id} isDirty={isDirty} isVermietung key="more" />]}
      additionalButtonsLast={[<TeamCalendar key="cal" />]}
      changedPropsToWatch={[["angebot", "freigabe"]]}
      data={data}
      dateString={displayDate}
      firstTag={
        <Tag color="purple" key="verm">
          Vermietung
        </Tag>
      }
      form={form}
      resetChanges={resetChanges}
      saveForm={saveForm}
      tags={tagsForTitle}
      title={title}
    >
      {children}
    </JazzFormAndHeaderExtended>
  );
}
