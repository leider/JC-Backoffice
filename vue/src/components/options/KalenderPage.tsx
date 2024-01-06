import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kalender, saveKalender } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { App, Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import Orte from "jc-shared/optionen/orte";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import FerienIcals from "jc-shared/optionen/ferienIcals";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";

export default function KalenderPage() {
  const ferienIcalsQuery = useQuery({
    queryKey: ["ferienIcals"],
    queryFn: kalender,
  });
  const [ferienIcals, setFerienIcals] = useState<FerienIcals>(new FerienIcals());
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);

  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  document.title = "Kalender";

  useEffect(() => {
    if (ferienIcalsQuery.data) {
      setFerienIcals(ferienIcalsQuery.data);
    }
  }, [ferienIcalsQuery.data]);

  const mutateKalender = useMutation({
    mutationFn: saveKalender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ferienIcals"] });
      notification.open({
        message: "Speichern erfolgreich",
        description: "Die Kalender wurden gespeichert",
        duration: 5,
      });
    },
  });

  const [form] = Form.useForm<Orte>();

  function initializeForm() {
    const deepCopy = ferienIcals.toJSON();
    form.setFieldsValue(deepCopy);
    const initial = ferienIcals.toJSON();
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, ferienIcals]);

  function saveForm() {
    form.validateFields().then(async () => {
      mutateKalender.mutate(new FerienIcals(form.getFieldsValue(true)));
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
      fieldName: "url",
      label: "URL",
      type: "text",
      width: "xl",
      required: true,
      uniqueValues: true,
    },
    {
      fieldName: "typ",
      label: "Typ",
      type: "text",
      width: "s",
      required: true,
      filters: ["Sonstiges", "Feiertag", "Ferien", "Vermietung"],
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
      <PageHeader title="Kalender" extra={[<SaveButton key="save" disabled={!dirty} />]} />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <InlineCollectionEditable form={form} columnDescriptions={columnDescriptions} embeddedArrayPath={["icals"]} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
