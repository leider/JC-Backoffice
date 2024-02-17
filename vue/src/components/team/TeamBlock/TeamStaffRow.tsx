import { Tag, theme } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { StaffType } from "jc-shared/konzert/staff.ts";
import { addOrRemoveUserToSection } from "@/commons/loader.ts";
import Konzert from "../../../../../shared/konzert/konzert.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import { ButtonStaff } from "@/components/team/TeamBlock/ButtonStaff.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

interface TeamStaffRowProps {
  sectionName: StaffType;
  veranstaltung: Konzert;
}

export function ActiveUsers({ sectionName, veranstaltung }: TeamStaffRowProps) {
  const teamContext = useContext(TeamContext);
  const usersAsOptions = teamContext.usersAsOptions;

  const [names, setNames] = useState<string[]>([]);

  const { useToken } = theme;
  const token = useToken().token;

  useEffect(() => {
    const staffCollection = veranstaltung.staff.getStaffCollection(sectionName);
    setNames(usersAsOptions.filter((user) => staffCollection.includes(user.value)).map((user) => user.label));
  }, [sectionName, usersAsOptions, veranstaltung.staff]);

  const { currentUser } = useJazzContext();

  return names.length > 0 ? (
    names.map((name) => (
      <Tag color={name === currentUser.name ? token.colorSuccess : undefined} key={name}>
        {name}
      </Tag>
    ))
  ) : (
    <span>Hier könnten wir Dich brauchen...</span>
  );
}

export function AddRemoveStaffButton({
  sectionName,
  veranstaltung,
  staffUpdated,
}: TeamStaffRowProps & { staffUpdated: (veranst: Konzert) => void }) {
  const { currentUser } = useJazzContext();

  const isIn = useMemo(
    () => veranstaltung.staff.getStaffCollection(sectionName).includes(currentUser.id),
    [currentUser.id, sectionName, veranstaltung.staff],
  );

  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: async (add: boolean) => addOrRemoveUserToSection(veranstaltung, sectionName, add),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung"] });
      staffUpdated(new Konzert(data));
    },
  });

  return isIn ? (
    <ButtonStaff
      add={false}
      callback={async function () {
        mutate.mutate(false);
      }}
    />
  ) : (
    <ButtonStaff
      add={true}
      callback={async function () {
        mutate.mutate(true);
      }}
    />
  );
}
