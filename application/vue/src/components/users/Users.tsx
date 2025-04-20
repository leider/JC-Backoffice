import React, { useCallback, useMemo, useState } from "react";
import { Col, Radio, RadioChangeEvent } from "antd";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import User from "jc-shared/user/user";
import { NewUserModal } from "@/components/users/UserModals";
import UserPanel from "@/components/users/UserPanel";
import { icons } from "@/widgets/buttonsAndIcons/Icons.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { RowWrapper } from "@/widgets/RowWrapper";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import map from "lodash/map";
import filter from "lodash/filter";
import { JazzRow } from "@/widgets/JazzRow";

type accessrightsTypes = "isSuperuser" | "isBookingTeam" | "isOrgaTeam" | "isAbendkasse" | "everybody";

export default function Users() {
  useDirtyBlocker(false);

  const [newUserOpen, setNewUserOpen] = useState<boolean>(false);
  const { currentUser, allUsers } = useJazzContext();
  const [selectedButton, setSelectedButton] = useState<accessrightsTypes>("everybody");

  document.title = "Userübersicht";

  function radioOption(icon: keyof typeof icons, label: string, value: string) {
    return {
      label: (
        <b>
          <IconForSmallBlock iconName={icon} size={12} /> {label}
        </b>
      ),
      value: value,
    };
  }

  const selectedUsers = useMemo(() => filter(allUsers, (u) => u.accessrights[selectedButton]), [selectedButton, allUsers]);

  const openNewUser = useCallback(() => setNewUserOpen(true), []);
  const selectButton = useCallback((event: RadioChangeEvent) => setSelectedButton(event.target.value), []);

  return (
    <>
      <NewUserModal isOpen={newUserOpen} setIsOpen={setNewUserOpen} />
      <JazzPageHeader
        buttons={
          currentUser.accessrights.isSuperuser
            ? [<ButtonWithIcon icon="PersonPlus" key="usernew" onClick={openNewUser} text="Neuer Benutzer" type="default" />]
            : undefined
        }
        tags={[
          <Radio.Group
            buttonStyle="solid"
            defaultValue="everybody"
            key="usertags"
            onChange={selectButton}
            optionType="button"
            options={[
              radioOption("EmojiSunglasses", "Admin", "isSuperuser"),
              radioOption("PersonCheck", "Booking", "isBookingTeam"),
              radioOption("Building", "Orga", "isOrgaTeam"),
              radioOption("Wallet2", "Abendkasse", "isAbendkasse"),
              radioOption("PersonBadge", "Jeder", "everybody"),
            ]}
          />,
        ]}
        title="Übersicht über die User"
      />
      <RowWrapper>
        <JazzRow>
          {map(selectedUsers, (user) => (
            <Col key={user.id} md={8} sm={12} xs={24} xxl={6}>
              <UserPanel currentUser={currentUser || new User({})} user={user} />
            </Col>
          ))}
        </JazzRow>
      </RowWrapper>
    </>
  );
}
