import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mailRules as mailRulesRestCall, saveMailRule } from "@/commons/loader-for-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, OrrpInlineCollectionEditable } from "@/widgets-react/OrrpInlineCollectionEditable";
import MailRule, { allMailrules } from "jc-shared/mail/mailRule";
import _ from "lodash";

export default function MailRules() {
  const mailRuleQuery = useQuery({ queryKey: ["mailRules"], queryFn: mailRulesRestCall });
  const [mailRules, setMailRules] = useState<MailRule[]>([]);
  const [initialValue, setInitialValue] = useState<{ allRules: any[] }>({ allRules: [] });
  const [dirty, setDirty] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (mailRuleQuery.data) {
      setMailRules(mailRuleQuery.data);
    }
  }, [mailRuleQuery.data]);

  const mutateRules = useMutation({
    mutationFn: saveMailRule,
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
      const newRules: any[] = form.getFieldsValue(true).allRules;
      const oldRules = initialValue.allRules;
      const found = _.differenceWith(oldRules, newRules, _.isEqual).map((r) => r.id);
      console.log({ newRules });
      console.log({ found });
      const changed = (newRules.filter((r) => found.includes(r.id)) || []).map((r) => new MailRule(_.cloneDeep(r)));
      changed.forEach((rule) => mutateRules.mutate(rule));
    });
  }

  const columnDescriptions: CollectionColDesc[] = [
    {
      fieldName: "name",
      label: "Name",
      type: "text",
      width: "l",
      required: true,
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
      <Row gutter={12}>
        <Col span={24}>
          <OrrpInlineCollectionEditable form={form} columnDescriptions={columnDescriptions} label="" embeddedArrayPath={["allRules"]} />
        </Col>
      </Row>
    </Form>
  );
}
