import User from "jc-shared/user/user";
import React, { useCallback, useEffect, useState } from "react";
import { App, Col, Collapse, Row, Space, theme } from "antd";
import { IconForSmallBlock } from "@/widgets/buttonsAndIcons/Icon.tsx";
import { ChangePasswordModal, EditUserModal } from "@/components/users/UserModals";
import { deleteUser } from "@/rest/loader.ts";
import { icons } from "@/widgets/buttonsAndIcons/Icons.tsx";
import { ButtonInUsers } from "@/components/users/ButtonInUsers.tsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ErsthelferSymbol } from "@/widgets/ErsthelferSymbol.tsx";
import { expandIcon } from "@/widgets/collapseExpandIcon.tsx";

export default function UserPanel({ user, currentUser }: { readonly user: User; readonly currentUser: User }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [icon, setIcon] = useState<keyof typeof icons>("PersonBadge");
  const [editUserOpen, setEditUserOpen] = useState<boolean>(false);
  const [passwordOpen, setPasswordOpen] = useState<boolean>(false);
  const [self, setSelf] = useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  const { modal } = App.useApp();
  const queryClient = useQueryClient();

  const mutateDeletion = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

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

  const editUser = useCallback(() => setEditUserOpen(true), []);
  const openPassword = useCallback(() => setPasswordOpen(true), []);
  const deleteConfirm = useCallback(() => {
    modal.confirm({
      type: "confirm",
      title: "User löschen",
      content: `Bist Du sicher, dass Du den User "${user.name}" löschen möchtest?`,
      onOk: () => mutateDeletion.mutate(user),
    });
  }, [modal, mutateDeletion, user]);

  const expandUnexpand = useCallback(() => setExpanded(!expanded), [expanded]);

  return (
    <>
      <EditUserModal isOpen={editUserOpen} setIsOpen={setEditUserOpen} user={user} />
      <ChangePasswordModal isOpen={passwordOpen} setIsOpen={setPasswordOpen} user={user} />
      <Collapse
        activeKey={expanded ? user.id : undefined}
        expandIcon={expandIcon({ color: textColor })}
        items={[
          {
            key: user.id,
            style: self ? { backgroundColor: lightGreen } : undefined,
            extra: (
              <Space>
                {canEdit ? <ButtonInUsers callback={editUser} type="edit" /> : null}
                {canEdit ? <ButtonInUsers callback={openPassword} type="changepass" /> : null}
                {currentUser.accessrights.isSuperuser && !self ? <ButtonInUsers callback={deleteConfirm} type="delete" /> : null}
              </Space>
            ),
            label: (
              <span>
                <IconForSmallBlock iconName={icon} style={{ paddingTop: "4" }} /> {user.name}{" "}
                {user.kannErsthelfer ? <ErsthelferSymbol /> : null}
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
                    <a href={`tel:${user.tel}`}> {user.tel}</a>
                  </Col>
                </Row>
              </>
            ),
          },
        ]}
        onChange={expandUnexpand}
        size="small"
      />
    </>
  );
}
