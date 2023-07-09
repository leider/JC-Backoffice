import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allUsers, deleteMailinglist, saveMailinglist } from "@/commons/loader-for-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { App, Col, Form, notification, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, OrrpInlineCollectionEditable } from "@/widgets-react/OrrpInlineCollectionEditable";
import Users, { Mailingliste } from "jc-shared/user/users";
import { UsersAsOption } from "@/components/team/UserMultiSelect";
import { fromFormObjectAsAny, toFormObject } from "@/components/mails/mailinglistCompUtils";
import { useSaveCollection } from "@/components/colored/collectionChangeHelpers";
import User from "jc-shared/user/user.ts";

export default function MailingLists() {
  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: () => allUsers(),
  });
  const [users, setUsers] = useState<User[]>([]);
  const [mailingLists, setMailingLists] = useState<any[]>([]);
  const [initialValue, setInitialValue] = useState<{ allLists: any[] }>({
    allLists: [],
  });
  const [dirty, setDirty] = useState<boolean>(false);
  const [usersAsOptions, setUsersAsOptions] = useState<UsersAsOption[]>([]);
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const saveCollection = useSaveCollection(notification);
  document.title = "Maillinglisten";

  useEffect(() => {
    if (usersQuery.data) {
      setUsers(usersQuery.data);
      setMailingLists(new Users(usersQuery.data).mailinglisten);
      setUsersAsOptions(usersQuery.data.map((user) => ({ label: user.name, value: user.id })));
    }
  }, [usersQuery.data]);

  const mutateLists = useMutation({
    mutationFn: saveMailinglist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const deleteLists = useMutation({
    mutationFn: deleteMailinglist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const [form] = Form.useForm<{ allLists: Mailingliste[] }>();

  function initializeForm() {
    const deepCopy = { allLists: mailingLists.map((l) => toFormObject(l)) };
    form.setFieldsValue(deepCopy);
    const initial = { allLists: mailingLists.map((l) => toFormObject(l)) };
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, mailingLists]);

  function saveForm() {
    form.validateFields().then(
      saveCollection({
        oldItems: initialValue.allLists,
        newItems: form.getFieldsValue(true).allLists,
        mapper: (item: any) => fromFormObjectAsAny(item, users),
        saveMutation: mutateLists,
        deleteMutation: deleteLists,
      })
    );
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
      usersAsOptions: usersAsOptions,
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
