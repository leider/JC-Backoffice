import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveOrte } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import Orte from "jc-shared/optionen/orte";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";

export default function OrtePage() {
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);
  const { orte, showSuccess } = useJazzContext();
  const queryClient = useQueryClient();

  document.title = "Orte";

  const mutateOrte = useMutation({
    mutationFn: saveOrte,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orte"] });
      showSuccess({ text: "Die Orte wurden gespeichert" });
    },
  });

  const [form] = Form.useForm<Orte>();

  function initializeForm() {
    const deepCopy = orte.toJSON();
    form.setFieldsValue(deepCopy);
    const initial = orte.toJSON();
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, orte]);

  function saveForm() {
    form.validateFields().then(async () => {
      mutateOrte.mutate(new Orte(form.getFieldsValue(true)));
    });
  }

  const columnDescriptions: CollectionColDesc[] = [
    {
      fieldName: "name",
      label: "Name",
      type: "text",
      width: "m",
      required: true,
      uniqueValues: true,
    },
    {
      fieldName: "flaeche",
      label: "Fläche",
      type: "integer",
      width: "s",
      required: true,
    },
    {
      fieldName: "pressename",
      label: "Für Presse",
      type: "text",
      width: "l",
      required: true,
    },
    {
      fieldName: "presseIn",
      label: 'Für Presse mit "in"',
      type: "text",
      width: "l",
      required: true,
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
      <JazzPageHeader title="Orte" buttons={[<SaveButton key="save" disabled={!dirty} />]} />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <InlineCollectionEditable form={form} columnDescriptions={columnDescriptions} embeddedArrayPath={["orte"]} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
