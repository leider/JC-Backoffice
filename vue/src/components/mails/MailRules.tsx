import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mailRules as mailRulesRestCall, saveMailRules } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { App, Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import MailRule, { allMailrules } from "jc-shared/mail/mailRule";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";

export default function MailRules() {
  const mailRuleQuery = useQuery({
    queryKey: ["mailRules"],
    queryFn: mailRulesRestCall,
  });
  const [mailRules, setMailRules] = useState<MailRule[]>([]);
  const [initialValue, setInitialValue] = useState<{ allRules: MailRule[] }>({
    allRules: [],
  });
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);

  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  document.title = "Mailregeln";

  useEffect(() => {
    if (mailRuleQuery.data) {
      setMailRules(mailRuleQuery.data);
    }
  }, [mailRuleQuery.data]);

  const mutateRules = useMutation({
    mutationFn: saveMailRules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mailRules"] });
    },
  });

  const [form] = Form.useForm<{ allRules: MailRule[] }>();

  function initializeForm() {
    const deepCopy = { allRules: mailRules.map((rule) => rule.toJSON()) };
    form.setFieldsValue(deepCopy);
    const initial = { allRules: mailRules.map((rule) => rule.toJSON()) };
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, mailRules]);

  function saveForm() {
    form.validateFields().then(async () => {
      mutateRules.mutate(form.getFieldsValue(true).allRules);
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
      width: "l",
      required: true,
      uniqueValues: true,
    },
    {
      fieldName: "email",
      label: "E-Mail",
      type: "text",
      width: "s",
      required: true,
    },
    {
      fieldName: "rule",
      label: "Regel",
      type: "text",
      width: "l",
      filters: allMailrules,
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
      <PageHeader title="Mailing Regeln" extra={[<SaveButton key="save" disabled={!dirty} />]}></PageHeader>
      <Row gutter={12} style={{ marginLeft: 0, marginRight: 0 }}>
        <Col span={24}>
          <InlineCollectionEditable form={form} columnDescriptions={columnDescriptions} label="" embeddedArrayPath={["allRules"]} />
        </Col>
      </Row>
    </Form>
  );
}
