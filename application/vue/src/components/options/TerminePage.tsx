import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { saveTermine, termine as allTermine } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import Termin from "jc-shared/optionen/termin";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import useCheckErrors from "@/commons/useCheckErrors.ts";

type TerminFlat = { dates: Date[]; beschreibung: string; typ?: string };

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

  const [form] = Form.useForm<{ allTermine: TerminFlat[] }>();

  function initializeForm() {
    const deepCopy = {
      allTermine: termine.map((termin) => ({
        dates: [termin.startDate, termin.endDate],
        beschreibung: termin.beschreibung,
        typ: termin.typ,
      })),
    };
    form.setFieldsValue(deepCopy);
    const initial = {
      allTermine: termine.map((termin) => ({
        dates: [termin.startDate, termin.endDate],
        beschreibung: termin.beschreibung,
        typ: termin.typ,
      })),
    };
    setInitialValue(initial);
    setDirty(areDifferent(initial, deepCopy));
    form.validateFields();
  }
  useEffect(initializeForm, [form, termine]);

  function saveForm() {
    form.validateFields().then(async () => {
      mutateTermine.mutate(
        form.getFieldsValue(true).allTermine.map(
          (each: TerminFlat) =>
            new Termin({
              startDate: each.dates[0],
              endDate: each.dates[1],
              beschreibung: each.beschreibung,
              typ: each.typ,
            }),
        ),
      );
    });
  }

  const columnDescriptions: Columns[] = [
    {
      dataIndex: ["dates"],
      title: "Start und Ende",
      type: "startEnd",
      required: true,
    },
    {
      dataIndex: "beschreibung",
      title: "Beschreibung",
      type: "text",
      required: true,
    },
    {
      dataIndex: "typ",
      title: "Typ",
      type: "text",
      width: "120px",
      filters: ["Sonstiges", "Feiertag", "Ferien", "Vermietung"],
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
      <JazzPageHeader title="Termine" buttons={[<SaveButton key="save" disabled={!dirty || hasErrors} />]} hasErrors={hasErrors} />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <EditableTable<Termin>
              columnDescriptions={columnDescriptions}
              name="allTermine"
              newRowFactory={(vals) => Object.assign({}, vals)}
            />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
