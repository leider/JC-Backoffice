import React, { useContext, useEffect, useMemo } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { useWatch } from "antd/es/form/Form";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import groupBy from "lodash/groupBy";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import EditableStaffRows from "@/components/team/TeamBlock/EditableStaffRows.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export interface MitarbeiterRowProps {
  sectionName: StaffType;
  label?: string;
  usersAsOptions: LabelAndValue[];
}

export default function MitarbeiterCard({ forVermietung = false }: { forVermietung?: boolean }) {
  const { lg } = useBreakpoint();

  const veranstContext = useContext(VeranstaltungContext);
  const vermietContext = useContext(VermietungContext);
  const { optionen } = useJazzContext();
  const form = (veranstContext || vermietContext)?.form;

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

  const preselection = useMemo(() => {
    const typByName = groupBy(optionen?.typenPlus || [], "name");
    return typByName[eventTyp]?.[0];
  }, [optionen, eventTyp]);

  useEffect(() => {
    if (preselection && !id) {
      ["kasse", "kasseV", "techniker", "technikerV", "merchandise", "mod"].forEach((key) => {
        form!.setFieldValue(["staff", key + "NotNeeded"], !preselection[key]);
      });
    }
  }, [form, id, preselection]);

  const usersAsOptions = useMemo(() => allUsers.map((user) => ({ label: user.name, value: user.id })), [allUsers]);

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Mitarbeiter" noTopBorder={lg}>
      <EditableStaffRows forVermietung={forVermietung} usersAsOptions={usersAsOptions} brauchtTechnik={brauchtTechnik} />
    </CollapsibleForVeranstaltung>
  );
}
