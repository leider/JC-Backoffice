import { Alert, Col, Divider, Form, Input, Row } from "antd";
import { changePassword, saveNewUser, saveUser } from "@/rest/loader.ts";
import User, { userGruppen } from "jc-shared/user/user";
import { TextField } from "@/widgets/TextField";
import SingleSelect from "@/widgets/SingleSelect";
import CheckItem from "@/widgets/CheckItem";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import ThreewayCheckbox from "@/widgets/ThreewayCheckbox.tsx";
import { useWatch } from "antd/es/form/Form";
import isNil from "lodash/isNil";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import { JazzModal } from "@/widgets/JazzModal.tsx";
import cloneDeep from "lodash/cloneDeep";

export function ChangePasswordModal({
  isOpen,
  setIsOpen,
  user,
}: {
  readonly isOpen: boolean;
  readonly setIsOpen: (open: boolean) => void;
  readonly user: User;
}) {
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
    form.setFieldsValue(cloneDeep(user));
  }, [form, user]);

  const saveForm = useCallback(
    async () => form.validateFields().then(async () => mutatePassword.mutate(new User(form.getFieldsValue(true)))),
    [form, mutatePassword],
  );

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  return (
    <Form autoComplete="off" form={form} layout="vertical" onFinish={saveForm}>
      <JazzModal closable={false} maskClosable={false} onCancel={close} onOk={saveForm} open={isOpen} title="Passwort ändern">
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
      </JazzModal>
    </Form>
  );
}
export function NewUserModal({ isOpen, setIsOpen }: { readonly isOpen: boolean; readonly setIsOpen: (open: boolean) => void }) {
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

  const saveForm = useCallback(
    async () =>
      form.validateFields().then(async () => {
        mutateNewUser.mutate(new User(form.getFieldsValue(true)));
        setIsOpen(false);
      }),
    [form, mutateNewUser, setIsOpen],
  );

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);

  return (
    <JazzModal closable={false} maskClosable={false} onCancel={close} onOk={saveForm} open={isOpen} title="Neuer Benutzer">
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
        <EditFields />
      </Form>
    </JazzModal>
  );
}

export function EditUserModal({
  isOpen,
  setIsOpen,
  user,
}: {
  readonly isOpen: boolean;
  readonly setIsOpen: (open: boolean) => void;
  readonly user: User;
}) {
  const [form] = Form.useForm<User>();
  const { showSuccess } = useJazzContext();
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);

  function initializeForm() {
    const deepCopy = cloneDeep(user);
    form.setFieldsValue(deepCopy);
    const initial = cloneDeep(user);
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

  const saveForm = useCallback(async () => {
    if (!dirty) {
      setIsOpen(false);
    }
    form.validateFields().then(async () => mutateUser.mutate(new User(form.getFieldsValue(true))));
  }, [dirty, setIsOpen, form, mutateUser]);

  const close = useCallback(() => setIsOpen(false), [setIsOpen]);
  const onValuesChange = useCallback(() => {
    const current = form.getFieldsValue(true);
    logDiffForDirty(initialValue, current, false);
    setDirty(areDifferent(initialValue, current));
  }, [form, initialValue]);

  return (
    <Form autoComplete="off" form={form} layout="vertical" onValuesChange={onValuesChange}>
      <JazzModal
        closable={false}
        maskClosable={false}
        okButtonProps={{ disabled: !dirty }}
        onCancel={close}
        onOk={saveForm}
        open={isOpen}
        title={user.id}
      >
        <EditFields />
      </JazzModal>
    </Form>
  );
}

function EditFields() {
  const { currentUser } = useJazzContext();
  const isSuperUser = useMemo(() => currentUser.accessrights.isSuperuser, [currentUser.accessrights.isSuperuser]);
  return (
    <Row gutter={8}>
      <Col span={24}>
        <TextField label="Vollständiger Name" name="name" required />
        <TextField isEmail label="E-Mail" name="email" required />
        <CheckItem label="Benachrichtigen, wenn Staff oder Kasse gesucht" name="wantsEmailReminders" />
        <IchKannFields />
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
        {isSuperUser ? <SingleSelect label="Rechte" name="gruppen" options={userGruppen.concat("")} /> : null}
        {isSuperUser ? <CheckItem label="Kassenfreigabe" name="kassenfreigabe" /> : null}
      </Col>
    </Row>
  );
}

export function IchKannFields() {
  const kannErsthelfer = useWatch("kannErsthelfer", { preserve: true });
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
