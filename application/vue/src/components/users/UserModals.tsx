import { Alert, Col, Divider, Form, FormInstance, Input, Row } from "antd";
import { changePassword, saveNewUser, saveUser } from "@/commons/loader.ts";
import User, { userGruppen } from "jc-shared/user/user";
import { TextField } from "@/widgets/TextField";
import SingleSelect from "@/widgets/SingleSelect";
import CheckItem from "@/widgets/CheckItem";
import React, { useEffect, useMemo, useState } from "react";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ThreewayCheckbox from "@/widgets/ThreewayCheckbox.tsx";
import { useWatch } from "antd/es/form/Form";
import isNil from "lodash/isNil";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import { JazzModal } from "@/widgets/JazzModal.tsx";

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
    <JazzModal
      closable={false}
      maskClosable={false}
      onCancel={() => setIsOpen(false)}
      onOk={saveForm}
      open={isOpen}
      title="Passwort ändern"
    >
      <Form autoComplete="off" form={form} layout="vertical" onFinish={saveForm}>
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
    </JazzModal>
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
    <JazzModal closable={false} maskClosable={false} onCancel={() => setIsOpen(false)} onOk={saveForm} open={isOpen} title="Neuer Benutzer">
      <Form autoComplete="off" form={form} layout="vertical" onFinish={saveForm}>
        <Row gutter={8}>
          <Col span={24}>
            <TextField label="User ID" name="id" required />
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
        <EditFields form={form} isSuperUser />
      </Form>
    </JazzModal>
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
    <JazzModal
      closable={false}
      maskClosable={false}
      okButtonProps={{ disabled: !dirty }}
      onCancel={() => setIsOpen(false)}
      onOk={saveForm}
      open={isOpen}
      title={user.id}
    >
      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
        onValuesChange={() => {
          const current = form.getFieldsValue(true);
          logDiffForDirty(initialValue, current, false);
          setDirty(areDifferent(initialValue, current));
        }}
      >
        <EditFields form={form} isSuperUser={isSuperUser} />
      </Form>
    </JazzModal>
  );
}

function EditFields({ isSuperUser, form }: { isSuperUser: boolean; form: FormInstance<User> }) {
  return (
    <Row gutter={8}>
      <Col span={24}>
        <TextField label="Vollständiger Name" name="name" required />
        <TextField isEmail label="E-Mail" name="email" required />
        <CheckItem label="Benachrichtigen, wenn Staff oder Kasse gesucht" name="wantsEmailReminders" />
        <IchKannFields form={form} />
        <TextField label="Telefon" name="tel" />
        <SingleSelect
          label="T-Shirt"
          name="tshirt"
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
        {isSuperUser && <SingleSelect label="Rechte" name="gruppen" options={userGruppen.concat("")} />}
        {isSuperUser && <CheckItem label="Kassenfreigabe" name="kassenfreigabe" />}
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
              description={<ThreewayCheckbox label="Ersthelfer" name="kannErsthelfer" />}
              message="Bitte sag uns, ob Du als Ersthelfer eingesetzt werden kannst."
              showIcon
              type="warning"
            />
          ) : (
            <CheckItem label="Ersthelfer" name="kannErsthelfer" />
          )}
        </Col>
      </Row>
      <Row gutter={8}>
        <Col span={5}>
          <CheckItem label="Kasse" name="kannKasse" />
        </Col>
        <Col span={5}>
          <CheckItem label="Ton" name="kannTon" />
        </Col>
        <Col span={5}>
          <CheckItem label="Licht" name="kannLicht" />
        </Col>
        <Col span={9}>
          <CheckItem label="Abendverantwortlicher" name="kannMaster" />
        </Col>
      </Row>
    </>
  );
}
