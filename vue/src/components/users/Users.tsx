import React, { useMemo, useState } from "react";
import { Col, Radio, Row } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { PageHeader } from "@ant-design/pro-layout";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import User from "jc-shared/user/user";
import { NewUserModal } from "@/components/users/UserModals";
import UserPanel from "@/components/users/UserPanel";
import { icons } from "@/widgets/buttonsAndIcons/Icons.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { RowWrapper } from "@/widgets/RowWrapper";

type accessrightsTypes = "isSuperuser" | "isBookingTeam" | "isOrgaTeam" | "isAbendkasse" | "everybody";

export default function Users() {
  const [newUserOpen, setNewUserOpen] = useState<boolean>(false);
  const { currentUser, allUsers } = useJazzContext();
  const [selectedButton, setSelectedButton] = useState<accessrightsTypes>("everybody");

  document.title = "Userübersicht";

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

  const selectedUsers = useMemo(() => allUsers.filter((u) => u.accessrights[selectedButton]), [selectedButton, allUsers]);

  return (
    <>
      <NewUserModal isOpen={newUserOpen} setIsOpen={setNewUserOpen} />
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
            onChange={(event) => setSelectedButton(event.target.value)}
          />
        }
        title="Übersicht über die User"
        extra={
          currentUser.accessrights.isSuperuser && (
            <ButtonWithIcon key="usernew" icon="PersonPlus" text="Neuer Benutzer" type="default" onClick={() => setNewUserOpen(true)} />
          )
        }
      />
      <RowWrapper>
        <Row gutter={12}>
          {selectedUsers.map((user) => (
            <Col key={user.id} xs={24} sm={12} md={8} xxl={6}>
              <UserPanel user={user} currentUser={currentUser || new User({})} />
            </Col>
          ))}
        </Row>
      </RowWrapper>
    </>
  );
}
