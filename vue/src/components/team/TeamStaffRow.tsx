import { App, Col, Row, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { StaffType } from "jc-shared/veranstaltung/staff";
import { useAuth } from "@/commons/auth";
import { addUserToSection, removeUserFromSection, saveVeranstaltung } from "@/commons/loader.ts";
import Veranstaltung from "jc-shared/veranstaltung/veranstaltung";
import User from "jc-shared/user/user";
import { ButtonStaff } from "@/components/Buttons";
import { UsersAsOption } from "@/components/team/UserMultiSelect";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TeamStaffRowProps {
  sectionName: StaffType;
  label: string;
  usersAsOptions: UsersAsOption[];
  veranstaltung: Veranstaltung;
}

const TeamStaffRow: React.FC<TeamStaffRowProps> = ({ usersAsOptions, sectionName, label, veranstaltung }: TeamStaffRowProps) => {
  const [ids, setIds] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(new User({}));

  const { context } = useAuth();

  const updateStuff = () => {
    const staffCollection = veranstaltung.staff.getStaffCollection(sectionName);
    setIds(staffCollection);
    setNames(usersAsOptions.filter((user) => staffCollection.includes(user.value)).map((user) => user.label));
  };
  useEffect(updateStuff, [veranstaltung]);
  useEffect(() => {
    setCurrentUser(context?.currentUser || new User({}));
  }, [context]);

  const queryClient = useQueryClient();
  const mutateAdd = useMutation({
    mutationFn: async (veranst: Veranstaltung) => addUserToSection(veranst, sectionName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", data.url] });
      veranstaltung.staff.addUserToSection(currentUser, sectionName);
      updateStuff();
    },
  });
  const mutateRemove = useMutation({
    mutationFn: async (veranst: Veranstaltung) => removeUserFromSection(veranst, sectionName),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["veranstaltung", data.url] });
      veranstaltung.staff.removeUserFromSection(currentUser, sectionName);
      updateStuff();
    },
  });
  async function addUser() {
    mutateAdd.mutate(veranstaltung);
  }
  async function removeUser() {
    mutateRemove.mutate(veranstaltung);
  }

  function DisplayNames() {
    return (
      <>
        {names.map((name) => (
          <Tag color={name === currentUser.name ? "#28a745" : undefined} key={name}>
            {name}
          </Tag>
        ))}
      </>
    );
  }

  return (
    <Row gutter={8}>
      <Col span={4}>
        <b>{label}</b>
      </Col>
      <Col span={16}>
        <DisplayNames />
      </Col>
      <Col span={4}>
        {ids.includes(currentUser.id) ? <ButtonStaff add={false} callback={removeUser} /> : <ButtonStaff add={true} callback={addUser} />}
      </Col>
    </Row>
  );
};
//ids.includes(currentUser) ? "JA" : "NEIN"
export default TeamStaffRow;
