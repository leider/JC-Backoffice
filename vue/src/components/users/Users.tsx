import React, { useEffect, useState } from "react";
import { allUsers } from "@/commons/loader-for-react";
import { Col, Radio, Row } from "antd";
import { useAuth } from "@/commons/auth";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";
import { PageHeader } from "@ant-design/pro-layout";
import { IconForSmallBlock } from "@/components/Icon";
import * as icons from "react-bootstrap-icons";
import User from "jc-shared/user/user";
import Accessrights from "jc-shared/user/accessrights";
import { NewUserModal } from "@/components/users/UserModals";
import UserPanel from "@/components/users/UserPanel";

export default function Users() {
  const [newUserOpen, setNewUserOpen] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>([]);
  const { context } = useAuth();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  async function loadUsers() {
    const users = await allUsers();
    users.forEach((u) => {
      u.accessrights = new Accessrights(u);
    });
    setUsers(users);
    setSelectedUsers(users);
  }

  useEffect(() => {
    loadUsers();
  }, []);

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
      <NewUserModal isOpen={newUserOpen} setIsOpen={setNewUserOpen} loadUsers={loadUsers} />
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
                  setSelectedUsers(users.filter((u) => (u.accessrights ? u.accessrights[event.target.value] : undefined)));
                }}
              />
            }
            title="Übersicht über die User"
            extra={
              context?.currentUser?.accessrights?.isSuperuser && (
                <ButtonWithIcon key="usernew" icon="PersonPlus" text="Neuer Benutzer" type="default" onClick={() => setNewUserOpen(true)} />
              )
            }
          />
        </Col>
      </Row>
      <Row gutter={8}>
        {selectedUsers.map((user) => (
          <Col key={user.id} xs={24} sm={12} md={8} xxl={6}>
            <UserPanel user={user} currentUser={context?.currentUser || new User({})} loadUsers={loadUsers} />
          </Col>
        ))}
      </Row>
    </>
  );
}
