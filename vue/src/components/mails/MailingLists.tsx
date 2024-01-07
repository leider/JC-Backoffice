import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMailinglists } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { App, Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import Users, { Mailingliste } from "jc-shared/user/users";
import { LabelAndValue } from "@/widgets/SingleSelect.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export default function MailingLists() {
  const { allUsers } = useJazzContext();
  const [mailingLists, setMailingLists] = useState<Mailingliste[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialValue, setInitialValue] = useState<{ allLists: any[] }>({
    allLists: [],
  });
  const [dirty, setDirty] = useState<boolean>(false);
  const [usersAsOptions, setUsersAsOptions] = useState<LabelAndValue[]>([]);
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  useDirtyBlocker(dirty);
  document.title = "Maillinglisten";

  useEffect(() => {
    setMailingLists(new Users(allUsers).mailinglisten);
    setUsersAsOptions(allUsers.map((user) => ({ label: user.name, value: user.id })));
  }, [allUsers]);

  const mutateLists = useMutation({
    mutationFn: saveMailinglists,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form] = Form.useForm<{ allLists: any[] }>();

  function initializeForm() {
    function toFormObject(liste: Mailingliste) {
      return {
        name: liste.name,
        users: liste.users,
      };
    }
    const deepCopy = { allLists: mailingLists.map((l) => toFormObject(l)).sort((a, b) => a.name.localeCompare(b.name)) };
    form.setFieldsValue(deepCopy);
    const initial = { allLists: mailingLists.map((l) => toFormObject(l)).sort((a, b) => a.name.localeCompare(b.name)) };
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, mailingLists]);

  function saveForm() {
    form.validateFields().then(async () => {
      mutateLists.mutate(form.getFieldsValue(true).allLists);
      notification.success({
        message: "Speichern erfolgreich",
        description: "Die Änderungen wurden gespeichert",
        placement: "topLeft",
        duration: 3,
      });
    });
  }

  const columnDescriptions: CollectionColDesc[] = [
    {
      fieldName: "name",
      label: "Name",
      type: "text",
      width: "xs",
      required: true,
      uniqueValues: true,
    },
    {
      fieldName: "users",
      label: "Users",
      type: "user",
      width: "xl",
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
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <InlineCollectionEditable form={form} columnDescriptions={columnDescriptions} embeddedArrayPath={["allLists"]} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
