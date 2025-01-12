import React, { useEffect, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useWatch } from "antd/es/form/Form";
import groupBy from "lodash/groupBy";
import EditableStaffRows from "@/components/team/TeamBlock/EditableStaffRows.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import map from "lodash/map";

export interface MitarbeiterRowProps {
  sectionName: StaffType;
  label?: string;
  usersAsOptions: UserWithKann[];
}

export default function MitarbeiterCard({ forVermietung = false }: { forVermietung?: boolean }) {
  const { lg } = useBreakpoint();
  const form = useFormInstance();
  const { allUsers, optionen } = useJazzContext();

  const eventTyp = useWatch(["kopf", "eventTyp"], { form, preserve: true });
  const id = useWatch("id", { form, preserve: true });
  const brauchtTechnik = useWatch("brauchtTechnik", { form, preserve: true });
  const abgesagt: boolean = useWatch(["kopf", "abgesagt"], { form, preserve: true });

  const preselection = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus || [], "name");
    return typByName[eventTyp]?.[0];
  }, [optionen, eventTyp]);

  useEffect(() => {
    if (preselection && !id) {
      ["kasse", "kasseV", "techniker", "technikerV", "merchandise", "mod"].forEach((key) => {
        const fieldName = ["staff", `${key}NotNeeded`];
        const value = !preselection[key];
        form.setFieldValue(fieldName, value);
      });
    }
  }, [form, id, preselection]);

  useEffect(() => {
    if (abgesagt) {
      ["kasse", "kasseV", "techniker", "technikerV", "merchandise", "mod"].forEach((key) => {
        const fieldName = ["staff", `${key}NotNeeded`];
        form.setFieldValue(fieldName, true);
      });
    }
  }, [abgesagt, form]);

  const usersAsOptions = useMemo(() => map(allUsers, "asUserAsOption"), [allUsers]);

  return (
    <Collapsible suffix="allgemeines" label="Mitarbeiter" noTopBorder={lg}>
      <EditableStaffRows forVermietung={forVermietung} usersAsOptions={usersAsOptions} brauchtTechnik={brauchtTechnik} />
    </Collapsible>
  );
}
