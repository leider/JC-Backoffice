import { PageHeader } from "@ant-design/pro-layout";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveTermin, termine as allTermine } from "@/commons/loader-for-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, OrrpInlineCollectionEditable } from "@/widgets-react/OrrpInlineCollectionEditable";
import Termin from "jc-shared/optionen/termin";
import _ from "lodash";
import { detailedDiff } from "deep-object-diff";
import { fromFormObjectAsAny, toFormObject } from "@/components/options/terminCompUtils";

export default function TerminePage() {
  const termineQuery = useQuery({ queryKey: ["termine"], queryFn: allTermine });
  const [termine, setTermine] = useState<Termin[]>([]);
  const [initialValue, setInitialValue] = useState<{ allTermine: any[] }>({ allTermine: [] });
  const [dirty, setDirty] = useState<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (termineQuery.data) {
      setTermine(termineQuery.data);
    }
  }, [termineQuery.data]);

  const mutateTermin = useMutation({
    mutationFn: saveTermin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["termine"] });
    },
  });

  const [form] = Form.useForm<{ allTermine: Termin[] }>();

  function initializeForm() {
    const deepCopy = { allTermine: termine.map((termin) => toFormObject(termin)) };
    form.setFieldsValue(deepCopy);
    const initial = { allTermine: termine.map((termin) => toFormObject(termin)) };
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, termine]);

  function saveForm() {
    form.validateFields().then(async () => {
      const newTermine: any[] = form.getFieldsValue(true).allTermine;
      const oldTermine = initialValue.allTermine;
      const found = _.differenceWith(oldTermine, newTermine, _.isEqual).map((t) => t.id);
      const changed = (newTermine.filter((t) => found.includes(t.id)) || []).map((t) => fromFormObjectAsAny(t));
      changed.forEach((termin) => mutateTermin.mutate(termin));
    });
  }

  const columnDescriptions: CollectionColDesc[] = [
    {
      fieldName: "period",
      label: "Start und Ende",
      type: "date",
      width: "m",
      required: true,
    },
    {
      fieldName: "beschreibung",
      label: "Beschreibung",
      type: "text",
      width: "m",
      required: true,
      uniqueValues: true,
    },
    {
      fieldName: "typ",
      label: "Typ",
      type: "text",
      width: "s",
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
      <PageHeader title="Termine" extra={[<SaveButton key="save" disabled={!dirty} />]}></PageHeader>
      <Row gutter={12}>
        <Col span={24}>
          <OrrpInlineCollectionEditable form={form} columnDescriptions={columnDescriptions} label="" embeddedArrayPath={["allTermine"]} />
        </Col>
      </Row>
    </Form>
  );
}
