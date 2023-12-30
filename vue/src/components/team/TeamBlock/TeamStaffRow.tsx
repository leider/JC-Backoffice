import { Tag, theme } from "antd";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { StaffType } from "jc-shared/veranstaltung/staff.ts";
import { useAuth } from "@/commons/authConsts.ts";
import { addUserToSection, removeUserFromSection } from "@/commons/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung.ts";
import User from "jc-shared/user/user.ts";
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

export function ActionButton({
  sectionName,
  veranstaltung,
  staffUpdated,
}: TeamStaffRowProps & { staffUpdated: (veranst: Veranstaltung) => void }) {
  const [ids, setIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(new User({}));

  const { context } = useAuth();
  useEffect(() => {
    setCurrentUser(context?.currentUser || new User({}));
  }, [context]);

  useEffect(() => {
    const staffCollection = veranstaltung.staff.getStaffCollection(sectionName);
    setIds(staffCollection);
  }, [sectionName, veranstaltung.staff]);

  const queryClient = useQueryClient();
  const mutateAdd = useMutation({
    mutationFn: async (veranst: Veranstaltung) => addUserToSection(veranst, sectionName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", data.url] });
      veranstaltung.staff.addUserToSection(currentUser, sectionName);
      staffUpdated(new Veranstaltung(data));
    },
  });
  const mutateRemove = useMutation({
    mutationFn: async (veranst: Veranstaltung) => removeUserFromSection(veranst, sectionName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", data.url] });
      veranstaltung.staff.removeUserFromSection(currentUser, sectionName);
      staffUpdated(new Veranstaltung(data));
    },
  });
  async function addUser() {
    mutateAdd.mutate(veranstaltung);
  }
  async function removeUser() {
    mutateRemove.mutate(veranstaltung);
  }
  return ids.includes(currentUser.id) ? <ButtonStaff add={false} callback={removeUser} /> : <ButtonStaff add={true} callback={addUser} />;
}
