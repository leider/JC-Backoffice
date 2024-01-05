import User from "jc-shared/user/user";
import React, { useEffect, useState } from "react";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { App, Col, Collapse, Row, Space, theme } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { ChangePasswordModal, EditUserModal } from "@/components/users/UserModals";
import { deleteUser } from "@/commons/loader.ts";
import { icons } from "@/widgets/buttonsAndIcons/Icons.tsx";
import { ButtonInUsers } from "@/components/users/ButtonInUsers.tsx";

export default function UserPanel({ user, currentUser, loadUsers }: { user: User; currentUser: User; loadUsers: () => void }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [icon, setIcon] = useState<keyof typeof icons>("PersonBadge");
  const [editUserOpen, setEditUserOpen] = useState<boolean>(false);
  const [passwordOpen, setPasswordOpen] = useState<boolean>(false);
  const [self, setSelf] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const { modal } = App.useApp();

  useEffect(() => {
    setCanEdit(currentUser.accessrights.canEditUser(user.id));
    setSelf(currentUser.id === user.id);
    if (user.accessrights.isSuperuser) {
      return setIcon("EmojiSunglasses");
    }
    if (user.accessrights.isBookingTeam) {
      return setIcon("PersonCheck");
    }
    if (user.accessrights.isOrgaTeam) {
      return setIcon("Building");
    }
    if (user.accessrights.isAbendkasse) {
      return setIcon("Wallet2");
    }
    setIcon("Dash");
  }, [user, currentUser]);

  const { useToken } = theme;

  const textColor = useToken().token.colorText;

  const lightGreen = useToken().token.colorSuccessBgHover;
  return (
    <>
      <EditUserModal isOpen={editUserOpen} setIsOpen={setEditUserOpen} user={user} isSuperUser={currentUser.accessrights.isSuperuser} />
      <ChangePasswordModal isOpen={passwordOpen} setIsOpen={setPasswordOpen} user={user} />
      <Collapse
        size="small"
        activeKey={expanded ? user.id : undefined}
        onChange={() => {
          setExpanded(!expanded);
        }}
        expandIcon={({ isActive }) => (isActive ? <CaretDown color={textColor} /> : <CaretRight color={textColor} />)}
        items={[
          {
            key: user.id,
            style: self ? { backgroundColor: lightGreen } : undefined,
            extra: (
              <Space>
                {canEdit && <ButtonInUsers type="edit" callback={() => setEditUserOpen(true)} />}
                {canEdit && <ButtonInUsers type="changepass" callback={() => setPasswordOpen(true)} />}
                {currentUser.accessrights.isSuperuser && !self && (
                  <ButtonInUsers
                    type="delete"
                    callback={() => {
                      modal.confirm({
                        type: "confirm",
                        title: "User löschen",
                        content: `Bist Du sicher, dass Du den User "${user.name}" löschen möchtest?`,
                        onOk: async () => {
                          await deleteUser(user);
                          loadUsers();
                        },
                      });
                    }}
                  />
                )}
              </Space>
            ),
            label: (
              <span>
                <IconForSmallBlock iconName={icon} /> {user.name}
              </span>
            ),
            children: (
              <>
                <Row gutter={8}>
                  <Col span={8}>
                    <b>Username:</b>
                  </Col>
                  <Col span={16}>{user.id}</Col>
                </Row>
                <Row gutter={8}>
                  <Col span={8}>
                    <b>E-Mail:</b>
                  </Col>
                  <Col span={16}>
                    <a href={`mailto:${user.email}`}>{user.email}</a>
                  </Col>
                </Row>
                <Row gutter={8}>
                  <Col span={8}>
                    <b>T-Shirt:</b>
                  </Col>
                  <Col span={16}>{user.tshirt}</Col>
                </Row>
                <Row gutter={8}>
                  <Col span={8}>
                    <b>Telefon:</b>
                  </Col>
                  <Col span={16}>
                    <a href={"tel:" + user.tel}> {user.tel}</a>
                  </Col>
                </Row>
              </>
            ),
          },
        ]}
      />
    </>
  );
}
