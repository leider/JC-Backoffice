import React, { useEffect, useState } from "react";
import { allUsers } from "@/commons/loader.ts";
import { Col, Radio, Row } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { PageHeader } from "@ant-design/pro-layout";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import User from "jc-shared/user/user";
import { NewUserModal } from "@/components/users/UserModals";
import UserPanel from "@/components/users/UserPanel";
import { useQuery } from "@tanstack/react-query";
import { icons } from "@/widgets/buttonsAndIcons/Icons.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function Users() {
  const [newUserOpen, setNewUserOpen] = useState<boolean>(false);
  const userQuery = useQuery({ queryKey: ["users"], queryFn: allUsers });
  const [users, setUsers] = useState<User[]>([]);
  const { currentUser } = useJazzContext();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  document.title = "Userübersicht";
  async function loadUsers() {
    const users = await allUsers();
    setUsers(users);
    setSelectedUsers(users);
  }

  useEffect(() => {
    if (userQuery.data) {
      const users = userQuery.data;
      setUsers(users);
      setSelectedUsers(users);
    }
  }, [userQuery.data]);

  function radioOption(icon: keyof typeof icons, label: string, value: string) {
    return {
      label: (
        <b>
          <IconForSmallBlock iconName={icon} /> {label}
        </b>
      ),
      value: value,
    };
  }

  return (
    <>
      <NewUserModal isOpen={newUserOpen} setIsOpen={setNewUserOpen} />
      <Row gutter={8}>
        <Col span={24}>
          <PageHeader
            footer={
              <Radio.Group
                options={[
                  radioOption("EmojiSunglasses", "Admin", "isSuperuser"),
                  radioOption("PersonCheck", "Booking", "isBookingTeam"),
                  radioOption("Building", "Orga", "isOrgaTeam"),
                  radioOption("Wallet2", "Abendkasse", "isAbendkasse"),
                  radioOption("PersonBadge", "Jeder", "everybody"),
                ]}
                optionType="button"
                buttonStyle="solid"
                defaultValue="everybody"
                onChange={(event) => {
                  const val: "isSuperuser" | "isBookingTeam" | "isOrgaTeam" | "isAbendkasse" | "everybody" = event.target.value;
                  setSelectedUsers(users.filter((u) => (u.accessrights ? u.accessrights[val] : undefined)));
                }}
              />
            }
            title="Übersicht über die User"
            extra={
              currentUser.accessrights.isSuperuser && (
                <ButtonWithIcon key="usernew" icon="PersonPlus" text="Neuer Benutzer" type="default" onClick={() => setNewUserOpen(true)} />
              )
            }
          />
        </Col>
      </Row>
      <Row gutter={8}>
        {selectedUsers.map((user) => (
          <Col key={user.id} xs={24} sm={12} md={8} xxl={6}>
            <UserPanel user={user} currentUser={currentUser || new User({})} loadUsers={loadUsers} />
          </Col>
        ))}
      </Row>
    </>
  );
}
