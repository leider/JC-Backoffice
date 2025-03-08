import React, { useCallback, useEffect, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useWatch } from "antd/es/form/Form";
import groupBy from "lodash/groupBy";
import EditableStaffRows from "@/components/team/TeamBlock/EditableStaffRows.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import map from "lodash/map";
import forEach from "lodash/forEach";
import { TypMitMehr } from "jc-shared/optionen/optionValues.ts";

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

  const updateStaff = useCallback(
    (preselection?: TypMitMehr) => {
      forEach(["kasse", "kasseV", "techniker", "technikerV", "merchandise", "mod"], (key) => {
        const fieldName = ["staff", `${key}NotNeeded`];
        const value = preselection ? !preselection[key] : true;
        form.setFieldValue(fieldName, value);
      });
    },
    [form],
  );

  useEffect(() => {
    if (preselection && !id) {
      updateStaff(preselection);
    }
  }, [form, id, preselection, updateStaff]);

  useEffect(() => {
    if (abgesagt) {
      updateStaff();
    }
  }, [abgesagt, form, updateStaff]);

  const usersAsOptions = useMemo(() => map(allUsers, "asUserAsOption"), [allUsers]);

  return (
    <Collapsible label="Mitarbeiter" noTopBorder={lg} suffix="allgemeines">
      <EditableStaffRows brauchtTechnik={brauchtTechnik} forVermietung={forVermietung} usersAsOptions={usersAsOptions} />
    </Collapsible>
  );
}
