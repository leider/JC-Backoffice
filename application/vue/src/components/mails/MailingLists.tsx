import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMailinglists } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import Users, { Mailingliste } from "jc-shared/user/users";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";

export default function MailingLists() {
  const { allUsers, showSuccess } = useJazzContext();
  const [mailingLists, setMailingLists] = useState<Mailingliste[]>([]);
  const [initialValue, setInitialValue] = useState<{ allLists: { name: string; users: string[] }[] }>({
    allLists: [],
  });
  const [dirty, setDirty] = useState<boolean>(false);
  const [usersAsOptions, setUsersAsOptions] = useState<UserWithKann[]>([]);
  const queryClient = useQueryClient();

  useDirtyBlocker(dirty);
  document.title = "Maillinglisten";

  useEffect(() => {
    setMailingLists(new Users(allUsers).mailinglisten);
    setUsersAsOptions(allUsers.map((user) => ({ label: user.name, value: user.id, kann: user.kannSections })));
  }, [allUsers]);

  const mutateLists = useMutation({
    mutationFn: saveMailinglists,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSuccess({ text: "Die Listen wurden gespeichert" });
    },
  });

  const [form] = Form.useForm<{ allLists: { name: string; users: string[] }[] }>();

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
      showSuccess({});
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
      usersWithKann: usersAsOptions,
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
      <JazzPageHeader title="Mailinglisten" buttons={[<SaveButton key="save" disabled={!dirty} />]}></JazzPageHeader>
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
