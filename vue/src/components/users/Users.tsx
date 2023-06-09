import React, { useEffect, useMemo, useState } from "react";
import { allUsers } from "@/commons/loader-for-react";
import { Col, Collapse, Radio, Row, Space, theme } from "antd";
import { useAuth } from "@/commons/auth";
import ButtonWithIcon from "@/widgets-react/ButtonWithIcon";
import { PageHeader } from "@ant-design/pro-layout";
import { IconForSmallBlock } from "@/components/Icon";
import * as icons from "react-bootstrap-icons";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import User from "jc-shared/user/user";
import Accessrights from "jc-shared/user/accessrights";
import { ButtonInUsers } from "@/components/Buttons";

function UserPanel({ user }: { user: User }) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [icon, setIcon] = useState<keyof typeof icons>("PersonBadge");

  useEffect(() => {
    if (user.accessrights?.isSuperuser) {
      return setIcon("EmojiSunglasses");
    }
    if (user.accessrights?.isBookingTeam) {
      return setIcon("PersonCheck");
    }
    if (user.accessrights?.isOrgaTeam) {
      return setIcon("Building");
    }
    if (user.accessrights?.isAbendkasse) {
      return setIcon("Wallet2");
    }
    setIcon("Dash");
  }, [user]);

  const { useToken } = theme;

  const textColor = useToken().token.colorText;

  return (
    <Collapse
      size="small"
      activeKey={expanded && user.id}
      onChange={() => {
        setExpanded(!expanded);
      }}
      expandIcon={({ isActive }) => (isActive ? <CaretDown color={textColor} /> : <CaretRight color={textColor} />)}
    >
      <Collapse.Panel
        key={user.id}
        extra={
          <Space>
            <ButtonInUsers type="edit" callback={() => {}} />
            <ButtonInUsers type="changepass" callback={() => {}} />
            <ButtonInUsers type="delete" callback={() => {}} />
          </Space>
        }
        header={
          <span>
            <IconForSmallBlock iconName={icon} /> {user.name}
          </span>
        }
      >
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
      </Collapse.Panel>
    </Collapse>
  );
}

export default function Users() {
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

  useEffect(() => {}, [selectedUsers]);

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
                <ButtonWithIcon key="usernew" icon="PersonPlus" text="Neuer Benutzer" type="default" />
              )
            }
          />
        </Col>
      </Row>
      <Row gutter={8}>
        {selectedUsers.map((user) => (
          <Col key={user.id} xs={24} sm={12} md={8} xxl={6}>
            <UserPanel user={user}></UserPanel>
          </Col>
        ))}
      </Row>
    </>
  );
}
