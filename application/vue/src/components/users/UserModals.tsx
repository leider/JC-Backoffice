import { Alert, Col, Divider, Form, FormInstance, Input, Modal, Row } from "antd";
import { changePassword, saveNewUser, saveUser } from "@/commons/loader.ts";
import User, { userGruppen } from "jc-shared/user/user";
import { TextField } from "@/widgets/TextField";
import SingleSelect from "@/widgets/SingleSelect";
import CheckItem from "@/widgets/CheckItem";
import React, { useEffect, useMemo, useState } from "react";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import ThreewayCheckbox from "@/widgets/ThreewayCheckbox.tsx";
import { useWatch } from "antd/es/form/Form";
import isNil from "lodash/isNil";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";

export function ChangePasswordModal({ isOpen, setIsOpen, user }: { isOpen: boolean; setIsOpen: (open: boolean) => void; user: User }) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { showSuccess } = useJazzContext();
  const mutatePassword = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", user.id] });
      showSuccess({});
      setIsOpen(false);
    },
  });

  useEffect(() => {
    form.setFieldsValue(user.toJSONWithoutPass());
  }, [form, user]);
  async function saveForm() {
    form.validateFields().then(async () => {
      mutatePassword.mutate(new User(form.getFieldsValue(true)));
    });
  }

  return (
    <Modal open={isOpen} onCancel={() => setIsOpen(false)} onOk={saveForm} closable={false} maskClosable={false}>
      <Form form={form} onFinish={saveForm} layout="vertical" autoComplete="off">
        <JazzPageHeader title="Passwort ändern" />
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
export function NewUserModal({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { showSuccess } = useJazzContext();

  const mutateNewUser = useMutation({
    mutationFn: saveNewUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSuccess({});
      setIsOpen(false);
    },
  });

  async function saveForm() {
    form.validateFields().then(async () => {
      mutateNewUser.mutate(new User(form.getFieldsValue(true)));
      setIsOpen(false);
    });
  }

  return (
    <Modal open={isOpen} onCancel={() => setIsOpen(false)} onOk={saveForm} closable={false} maskClosable={false}>
      <Form form={form} onFinish={saveForm} layout="vertical" autoComplete="off">
        <JazzPageHeader title="Neuer Benutzer" />
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
        <EditFields isSuperUser={true} form={form} />
      </Form>
    </Modal>
  );
}

export function EditUserModal({
  isOpen,
  setIsOpen,
  user,
  isSuperUser,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: User;
  isSuperUser: boolean;
}) {
  const [form] = Form.useForm<User>();
  const { showSuccess } = useJazzContext();
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
  const queryClient = useQueryClient();
  const mutateUser = useMutation({
    mutationFn: saveUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSuccess({});
      setIsOpen(false);
    },
  });

  async function saveForm() {
    if (!dirty) {
      setIsOpen(false);
    }
    form.validateFields().then(async () => {
      mutateUser.mutate(new User(form.getFieldsValue(true)));
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
          const current = form.getFieldsValue(true);
          logDiffForDirty(initialValue, current, false);
          setDirty(areDifferent(initialValue, current));
        }}
        layout="vertical"
        autoComplete="off"
      >
        <JazzPageHeader title={user.id} />
        <EditFields isSuperUser={isSuperUser} form={form} />
      </Form>
    </Modal>
  );
}

function EditFields({ isSuperUser, form }: { isSuperUser: boolean; form: FormInstance<User> }) {
  return (
    <Row gutter={8}>
      <Col span={24}>
        <TextField name={"name"} label="Vollständiger Name" required />
        <TextField name={"email"} label="E-Mail" isEmail required />
        <CheckItem name="wantsEmailReminders" label="Benachrichtigen, wenn Staff oder Kasse gesucht" />
        <IchKannFields form={form} />
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
        {isSuperUser && <SingleSelect name="gruppen" label="Rechte" options={userGruppen.concat("")} />}
        {isSuperUser && <CheckItem name="kassenfreigabe" label="Kassenfreigabe" />}
      </Col>
    </Row>
  );
}

export function IchKannFields({ form }: { form: FormInstance<User> }) {
  const kannErsthelfer = useWatch("kannErsthelfer", { form, preserve: true });
  const keinErsthelferGesetzt = useMemo(() => isNil(kannErsthelfer), [kannErsthelfer]);
  return (
    <>
      <Divider orientation="left" orientationMargin="0">
        Ich kann helfen bei...
      </Divider>
      <Row gutter={8}>
        <Col span={24}>
          {keinErsthelferGesetzt ? (
            <Alert
              message="Bitte sag uns, ob Du als Ersthelfer eingesetzt werden kannst."
              description={<ThreewayCheckbox name="kannErsthelfer" label="Ersthelfer" />}
              type="warning"
              showIcon
            />
          ) : (
            <CheckItem name="kannErsthelfer" label="Ersthelfer" />
          )}
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={5}>
          <CheckItem name="kannKasse" label="Kasse" />
        </Col>
        <Col span={5}>
          <CheckItem name="kannTon" label="Ton" />
        </Col>
        <Col span={5}>
          <CheckItem name="kannLicht" label="Licht" />
        </Col>
        <Col span={9}>
          <CheckItem name="kannMaster" label="Abendverantwortlicher" />
        </Col>
      </Row>
    </>
  );
}
