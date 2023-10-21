import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allUsers, saveMailinglists } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { App, Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, OrrpInlineCollectionEditable } from "@/widgets/OrrpInlineCollectionEditable";
import Users, { Mailingliste } from "jc-shared/user/users";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";

export default function MailingLists() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => allUsers(),
  });
  const [mailingLists, setMailingLists] = useState<any[]>([]);
  const [initialValue, setInitialValue] = useState<{ allLists: any[] }>({
    allLists: [],
  });
  const [dirty, setDirty] = useState<boolean>(false);
  const [usersAsOptions, setUsersAsOptions] = useState<LabelAndValue[]>([]);
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  document.title = "Maillinglisten";

  useEffect(() => {
    if (usersQuery.data) {
      setMailingLists(new Users(usersQuery.data).mailinglisten);
      setUsersAsOptions(usersQuery.data.map((user) => ({ label: user.name, value: user.id })));
    }
  }, [usersQuery.data]);

  const mutateLists = useMutation({
    mutationFn: saveMailinglists,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [form] = Form.useForm<{ allLists: Mailingliste[] }>();

  function initializeForm() {
    function toFormObject(liste: Mailingliste): object {
      return {
        name: liste.name,
        users: liste.users.map((u) => u.id),
      };
    }
    const deepCopy = { allLists: mailingLists.map((l) => toFormObject(l)) };
    form.setFieldsValue(deepCopy);
    const initial = { allLists: mailingLists.map((l) => toFormObject(l)) };
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, mailingLists]);

  function saveForm() {
    form.validateFields().then(async () => {
      mutateLists.mutate(form.getFieldsValue(true).allLists);
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Änderungen wurden gespeichert",
        duration: 5,
      });
    });
  }

  const columnDescriptions: CollectionColDesc[] = [
    {
      fieldName: "name",
      label: "Name",
      type: "text",
      width: "s",
      required: true,
      uniqueValues: true,
    },
    {
      fieldName: "users",
      label: "Users",
      type: "user",
      width: "s",
      labelsAndValues: usersAsOptions,
      required: true,
    },
  ];
  return (
    <Form
      form={form}
      onValuesChange={() => {
        // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
        // console.log({ diff });
        // console.log({ initialValue });
        // console.log({ form: form.getFieldsValue(true) });
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <PageHeader title="Mailinglisten" extra={[<SaveButton key="save" disabled={!dirty} />]}></PageHeader>
      <Row gutter={12}>
        <Col span={24}>
          <OrrpInlineCollectionEditable form={form} columnDescriptions={columnDescriptions} label="" embeddedArrayPath={["allLists"]} />
        </Col>
      </Row>
    </Form>
  );
}
