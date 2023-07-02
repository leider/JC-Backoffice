import { Col, Form, FormInstance, Input, Modal, Row } from "antd";
import { changePassword, saveNewUser, saveUser } from "@/commons/loader-for-react";
import User from "jc-shared/user/user";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { PageHeader } from "@ant-design/pro-layout";
import { TextField } from "@/widgets-react/TextField";
import SingleSelect from "@/widgets-react/SingleSelect";
import CheckItem from "@/widgets-react/CheckItem";
import React, { useEffect, useState } from "react";
import { areDifferent } from "@/commons/comparingAndTransforming";

export function ChangePasswordModal({
  isOpen,
  setIsOpen,
  user,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  loadUsers: () => void;
  user: User;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(user.toJSONWithoutPass());
  }, [form, user]);
  async function saveForm() {
    form.validateFields().then(async () => {
      await changePassword(new User(form.getFieldsValue(true)));
      setIsOpen(false);
    });
  }

  return (
    <Modal open={isOpen} onCancel={() => setIsOpen(false)} onOk={saveForm} closable={false} maskClosable={false}>
      <Form form={form} onFinish={saveForm} layout="vertical" autoComplete="off">
        <PageHeader title="Passwort ändern" />
        <Row gutter={8}>
          <Col span={24}>
            <Form.Item
              label={<b>Passwort:</b>}
              name="password"
              rules={[
                {
                  required: true,
                  message: "Du musst einen Wert eingeben",
                },
                { min: 6, message: "Mindestens 6 Zeichen" },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
export function NewUserModal({
  isOpen,
  setIsOpen,
  loadUsers,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  loadUsers: () => void;
}) {
  const [form] = Form.useForm();
  async function saveForm() {
    form.validateFields().then(async () => {
      await saveNewUser(new User(form.getFieldsValue(true)));
      loadUsers();
      setIsOpen(false);
    });
  }

  return (
    <Modal open={isOpen} onCancel={() => setIsOpen(false)} onOk={saveForm} closable={false} maskClosable={false}>
      <Form form={form} onFinish={saveForm} layout="vertical" autoComplete="off">
        <PageHeader title="Neuer Benutzer" />
        <Row gutter={8}>
          <Col span={24}>
            <TextField name={"id"} label="User ID" required />
            <Form.Item
              label={<b>Passwort:</b>}
              name="password"
              rules={[
                {
                  required: true,
                  message: "Du musst einen Wert eingeben",
                },
              ]}
            >
              <Input.Password />
            </Form.Item>
          </Col>
        </Row>
        <EditFields form={form} isSuperUser={true} />
      </Form>
    </Modal>
  );
}

export function EditUserModal({
  isOpen,
  setIsOpen,
  loadUsers,
  user,
  isSuperUser,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  loadUsers: () => void;
  user: User;
  isSuperUser: boolean;
}) {
  const [form] = Form.useForm();

  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);

  function initializeForm() {
    const deepCopy = user.toJSONWithoutPass();
    form.setFieldsValue(deepCopy);
    const initial = user.toJSONWithoutPass();
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, user]);
  async function saveForm() {
    if (!dirty) {
      setIsOpen(false);
    }
    form.validateFields().then(async () => {
      await saveUser(new User(form.getFieldsValue(true)));
      loadUsers();
      setIsOpen(false);
    });
  }

  return (
    <Modal
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      onOk={saveForm}
      okButtonProps={{ disabled: !dirty }}
      closable={false}
      maskClosable={false}
    >
      <Form
        form={form}
        onValuesChange={() => {
          // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
          // console.log({ diff });
          // console.log({ initialValue });
          // console.log({ form: form.getFieldsValue(true) });
          setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
        }}
        layout="vertical"
        autoComplete="off"
      >
        <PageHeader title={user.id} />
        <EditFields form={form} isSuperUser={isSuperUser} />
      </Form>
    </Modal>
  );
}

function EditFields({ form, isSuperUser }: { form: FormInstance; isSuperUser: boolean }) {
  return (
    <Row gutter={8}>
      <Col span={24}>
        <TextField name={"name"} label="Vollständiger Name" required />
        <TextField name={"email"} label="E-Mail" isEmail required />
        <CheckItem name="wantsEmailReminders" label="Benachrichtigen, wenn Staff" />
        <TextField name={"tel"} label="Telefon" />
        <SingleSelect
          name="tshirt"
          label="T-Shirt"
          options={[
            "",
            "S",
            "M",
            "L",
            "XL",
            "XXL",
            "XXXL",
            "No Shirt",
            "Ladies' XS",
            "Ladies' S",
            "Ladies' M",
            "Ladies' L",
            "Ladies' XL",
            "Ladies' XXL",
          ]}
        />
        {isSuperUser && (
          <SingleSelect name="gruppen" label="Rechte" options={["superusers", "bookingTeam", "orgaTeam", "abendkasse", ""]} />
        )}
        {isSuperUser && (
          <CheckItem
            name="kassenfreigabe"
            label="Kassenfreigabe"
            onChange={function (event: CheckboxChangeEvent) {
              form.setFieldValue("rechte", event.target.checked ? ["kassenfreigabe"] : []);
            }}
          />
        )}
      </Col>
    </Row>
  );
}
