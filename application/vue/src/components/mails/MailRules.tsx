import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mailRules as mailRulesRestCall, saveMailRules } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import MailRule, { allMailrules } from "jc-shared/mail/mailRule";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";

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
  const { showSuccess } = useJazzContext();
  const queryClient = useQueryClient();

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
      showSuccess({ text: "Die Regeln wurden gespeichert" });
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
      showSuccess({});
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
      fieldName: "email",
      label: "E-Mail",
      type: "text",
      width: "m",
      required: true,
    },
    {
      fieldName: "rule",
      label: "Regel",
      type: "text",
      width: "s",
      filters: allMailrules,
    },
  ];
  return (
    <Form
      form={form}
      onValuesChange={() => {
        const current = form.getFieldsValue(true);
        logDiffForDirty(initialValue, current, false);
        setDirty(areDifferent(initialValue, current));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <JazzPageHeader title="Mailing Regeln" buttons={[<SaveButton key="save" disabled={!dirty} />]}></JazzPageHeader>
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <InlineCollectionEditable form={form} columnDescriptions={columnDescriptions} embeddedArrayPath={["allRules"]} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
