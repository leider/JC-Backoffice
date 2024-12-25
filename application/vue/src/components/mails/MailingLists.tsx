import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveMailinglists } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import Users, { Mailingliste } from "jc-shared/user/users";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import useCheckErrors from "@/commons/useCheckErrors.ts";

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

  const columnDescriptions: Columns[] = [
    {
      dataIndex: "name",
      title: "Name",
      type: "text",
      width: "150px",
      required: true,
      uniqueValues: true,
    },
    {
      dataIndex: "users",
      title: "Users",
      type: "user",
      usersWithKann: usersAsOptions,
      required: true,
    },
  ];

  const { hasErrors, checkErrors } = useCheckErrors(form);

  return (
    <Form
      form={form}
      onValuesChange={() => {
        const current = form.getFieldsValue(true);
        logDiffForDirty(initialValue, current, false);
        setDirty(areDifferent(initialValue, current));
        checkErrors();
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <JazzPageHeader title="Mailinglisten" buttons={[<SaveButton key="save" disabled={!dirty || hasErrors} />]} hasErrors={hasErrors} />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <EditableTable<{ name?: string; users: string[] }>
              columnDescriptions={columnDescriptions}
              name="allLists"
              newRowFactory={(val) => {
                return Object.assign({ users: [] }, val);
              }}
              usersWithKann={usersAsOptions}
            />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
