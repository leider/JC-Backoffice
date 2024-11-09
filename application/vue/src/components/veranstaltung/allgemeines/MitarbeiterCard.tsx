import React, { useEffect, useMemo } from "react";
import Collapsible from "@/widgets/Collapsible.tsx";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useWatch } from "antd/es/form/Form";
import groupBy from "lodash/groupBy";
import EditableStaffRows from "@/components/team/TeamBlock/EditableStaffRows.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { UserWithKann } from "@/components/team/MitarbeiterMultiSelect.tsx";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import { FormInstance } from "antd";
import Konzert from "jc-shared/konzert/konzert.ts";
import Vermietung from "jc-shared/vermietung/vermietung.ts";

export interface MitarbeiterRowProps {
  sectionName: StaffType;
  label?: string;
  usersAsOptions: UserWithKann[];
}

export default function MitarbeiterCard({
  forVermietung = false,
  form,
}: {
  forVermietung?: boolean;
  form: FormInstance<Vermietung> | FormInstance<Konzert>;
}) {
  const { lg } = useBreakpoint();

  const { optionen } = useJazzContext();

  const { allUsers } = useJazzContext();

  const eventTyp = useWatch(["kopf", "eventTyp"], {
    form,
    preserve: true,
  });

  const id = useWatch("id", {
    form,
    preserve: true,
  });

  const brauchtTechnik = useWatch("brauchtTechnik", {
    form,
    preserve: true,
  });

  const abgesagt: boolean = useWatch(["kopf", "abgesagt"], {
    form,
    preserve: true,
  });

  const preselection = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus || [], "name");
    return typByName[eventTyp]?.[0];
  }, [optionen, eventTyp]);

  useEffect(() => {
    if (preselection && !id) {
      ["kasse", "kasseV", "techniker", "technikerV", "merchandise", "mod"].forEach((key) => {
        const fieldName = ["staff", `${key}NotNeeded`];
        const value = preselection[key];
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
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

  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })), [allUsers]);

  return (
    <Collapsible suffix="allgemeines" label="Mitarbeiter" noTopBorder={lg}>
      <EditableStaffRows forVermietung={forVermietung} usersAsOptions={usersAsOptions} brauchtTechnik={brauchtTechnik} />
    </Collapsible>
  );
}
