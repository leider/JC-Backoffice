import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orte as orteRestCall, saveOrte } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { App, Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import Orte from "jc-shared/optionen/orte";
import { CollectionColDesc, OrrpInlineCollectionEditable } from "@/widgets/OrrpInlineCollectionEditable";

export default function OrtePage() {
  const ortQuery = useQuery({ queryKey: ["orte"], queryFn: orteRestCall });
  const [orte, setOrte] = useState<Orte>(new Orte());
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  document.title = "Orte";

  useEffect(() => {
    if (ortQuery.data) {
      setOrte(ortQuery.data);
    }
  }, [ortQuery.data]);

  const mutateOrte = useMutation({
    mutationFn: saveOrte,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orte"] });
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Orte wurden gespeichert",
        duration: 5,
      });
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
      width: "l",
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
        // const diff = detailedDiff(initialValue, form.getFieldsValue(true));
        // console.log({ diff });
        // console.log({ initialValue });
        // console.log({ form: form.getFieldsValue(true) });
        setDirty(areDifferent(initialValue, form.getFieldsValue(true)));
      }}
      onFinish={saveForm}
      layout="vertical"
    >
      <PageHeader title="Orte" extra={[<SaveButton key="save" disabled={!dirty} />]}></PageHeader>
      <Row gutter={12}>
        <Col span={24}>
          <OrrpInlineCollectionEditable form={form} columnDescriptions={columnDescriptions} label="" embeddedArrayPath={["orte"]} />
        </Col>
      </Row>
    </Form>
  );
}
