import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveOrte } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import Orte from "jc-shared/optionen/orte";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable";
import useCheckErrors from "@/commons/useCheckErrors.ts";
import { Columns } from "@/widgets/EditableTable/types.ts";

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

  const columnDescriptions: Columns[] = [
    { dataIndex: "name", title: "Name", type: "text", width: "20%", required: true, uniqueValues: true },
    { dataIndex: "flaeche", title: "Fläche", type: "integer", required: true },
    { dataIndex: "pressename", title: "Für Presse", type: "text", width: "30%", required: true },
    { dataIndex: "presseIn", title: 'Für Presse mit "in"', type: "text", width: "30%", required: true },
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
      <JazzPageHeader title="Orte" buttons={[<SaveButton key="save" disabled={!dirty || hasErrors} />]} hasErrors={hasErrors} />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <EditableTable<{ name: string; flaeche: number; pressename: string; presseIn: string }>
              columnDescriptions={columnDescriptions}
              name="orte"
              newRowFactory={(val) => Object.assign({ flaeche: 0 }, val)}
            />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
