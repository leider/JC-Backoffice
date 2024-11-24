import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveTermine, termine as allTermine } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import { CollectionColDesc, InlineCollectionEditable } from "@/widgets/InlineCollectionEditable";
import Termin from "jc-shared/optionen/termin";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";

export default function TerminePage() {
  const termineQuery = useQuery({ queryKey: ["termine"], queryFn: allTermine });
  const [termine, setTermine] = useState<Termin[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [initialValue, setInitialValue] = useState<{ allTermine: any[] }>({
    allTermine: [],
  });
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);
  const { showSuccess } = useJazzContext();
  const queryClient = useQueryClient();

  document.title = "Termine";

  useEffect(() => {
    if (termineQuery.data) {
      setTermine(termineQuery.data);
    }
  }, [termineQuery.data]);

  const mutateTermine = useMutation({
    mutationFn: saveTermine,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["termine"] });
      showSuccess({});
    },
  });

  const [form] = Form.useForm<{ allTermine: Termin[] }>();

  function initializeForm() {
    const deepCopy = {
      allTermine: termine.map((termin) => termin.toJSON()),
    };
    form.setFieldsValue(deepCopy);
    const initial = {
      allTermine: termine.map((termin) => termin.toJSON()),
    };
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, termine]);

  function saveForm() {
    form.validateFields().then(async () => {
      mutateTermine.mutate(form.getFieldsValue(true).allTermine.map((each: Termin) => new Termin(each)));
    });
  }

  const columnDescriptions: CollectionColDesc[] = [
    {
      fieldName: ["startDate", "endDate"],
      label: "Start und Ende",
      type: "startEnd",
      width: "s",
      required: true,
    },
    {
      fieldName: "beschreibung",
      label: "Beschreibung",
      type: "text",
      width: "l",
      required: true,
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
      <JazzPageHeader title="Termine" buttons={[<SaveButton key="save" disabled={!dirty} />]} />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <InlineCollectionEditable form={form} columnDescriptions={columnDescriptions} embeddedArrayPath={["allTermine"]} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
