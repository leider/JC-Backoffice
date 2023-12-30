import React, { useContext, useEffect, useMemo, useState } from "react";
import CollapsibleForVeranstaltung from "@/components/veranstaltung/CollapsibleForVeranstaltung";
import useBreakpoint from "antd/es/grid/hooks/useBreakpoint";
import { useQuery } from "@tanstack/react-query";
import { allUsers } from "@/commons/loader.ts";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { useWatch } from "antd/es/form/Form";
import { VeranstaltungContext } from "@/components/veranstaltung/VeranstaltungComp.tsx";
import groupBy from "lodash/groupBy";
import { VermietungContext } from "@/components/vermietung/VermietungComp.tsx";
import EditableStaffRows from "@/components/team/TeamBlock/EditableStaffRows.tsx";

export interface MitarbeiterRowProps {
  sectionName: StaffType;
  label?: string;
  usersAsOptions: LabelAndValue[];
}

export default function MitarbeiterCard({ forVermietung = false }: { forVermietung?: boolean }) {
  const { lg } = useBreakpoint();

  const veranstContext = useContext(VeranstaltungContext);
  const vermietContext = useContext(VermietungContext);
  const form = (veranstContext || vermietContext)?.form;
  const optionen = (veranstContext || vermietContext)?.optionen;

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

  const userQuery = useQuery({ queryKey: ["users"], queryFn: allUsers });
  const [usersAsOptions, setUsersAsOptions] = useState<LabelAndValue[]>([]);
  useEffect(() => {
    if (userQuery.data) {
      setUsersAsOptions(userQuery.data.map((user) => ({ label: user.name, value: user.id })));
    }
  }, [userQuery.data]);

  return (
    <CollapsibleForVeranstaltung suffix="allgemeines" label="Mitarbeiter" noTopBorder={lg}>
      <EditableStaffRows forVermietung={forVermietung} usersAsOptions={usersAsOptions} brauchtTechnik={brauchtTechnik} />
    </CollapsibleForVeranstaltung>
  );
}
