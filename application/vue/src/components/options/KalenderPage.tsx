import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kalender, saveKalender } from "@/commons/loader.ts";
import * as React from "react";
import { useEffect, useState } from "react";
import { Col, Form, Row } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming";
import { SaveButton } from "@/components/colored/JazzButtons";
import Orte from "jc-shared/optionen/orte";
import FerienIcals, { Ical } from "jc-shared/optionen/ferienIcals";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import EditableTable from "@/widgets/EditableTable/EditableTable.tsx";
import { Columns } from "@/widgets/EditableTable/types.ts";
import useCheckErrors from "@/commons/useCheckErrors.ts";

export default function KalenderPage() {
  const ferienIcalsQuery = useQuery({
    queryKey: ["ferienIcals"],
    queryFn: kalender,
  });
  const [ferienIcals, setFerienIcals] = useState<FerienIcals>(new FerienIcals());
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);
  const { showSuccess } = useJazzContext();
  const queryClient = useQueryClient();

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
      showSuccess({ text: "Die Kalender wurden gespeichert" });
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

  const columnDescriptions: Columns[] = [
    {
      dataIndex: "name",
      title: "Name",
      type: "text",
      width: "20%",
      required: true,
      uniqueValues: true,
    },
    {
      dataIndex: "url",
      title: "URL",
      type: "text",
      required: true,
      uniqueValues: true,
    },
    {
      dataIndex: "typ",
      title: "Typ",
      type: "text",
      width: "120px",
      required: true,
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
      <JazzPageHeader title="Kalender" buttons={[<SaveButton key="save" disabled={!dirty || hasErrors} />]} hasErrors={hasErrors} />
      <RowWrapper>
        <Row gutter={12}>
          <Col span={24}>
            <EditableTable<Ical> columnDescriptions={columnDescriptions} name="icals" newRowFactory={(vals) => Object.assign({}, vals)} />
          </Col>
        </Row>
      </RowWrapper>
    </Form>
  );
}
