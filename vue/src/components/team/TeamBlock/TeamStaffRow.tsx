import { Tag, theme } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import { useAuth } from "@/commons/authConsts.ts";
import { addOrRemoveUserToSection } from "@/commons/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamContext } from "@/components/team/Veranstaltungen.tsx";
import { ButtonStaff } from "@/components/team/TeamBlock/ButtonStaff.tsx";

interface TeamStaffRowProps {
  sectionName: StaffType;
  veranstaltung: Veranstaltung;
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

  const { context } = useAuth();
  const currentUser = useMemo(() => context.currentUser, [context.currentUser]);

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
}: TeamStaffRowProps & { staffUpdated: (veranst: Veranstaltung) => void }) {
  const [isIn, setIsIn] = useState(false);
  const { context } = useAuth();

  useEffect(() => {
    setIsIn(veranstaltung.staff.getStaffCollection(sectionName).includes(context.currentUser.id));
  }, [context.currentUser.id, sectionName, veranstaltung.staff]);

  const queryClient = useQueryClient();
  const mutate = useMutation({
    mutationFn: async (add: boolean) => addOrRemoveUserToSection(veranstaltung, sectionName, add),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", data.url] });
      staffUpdated(new Veranstaltung(data));
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
