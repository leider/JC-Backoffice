import * as React from "react";
import { PropsWithChildren, useEffect, useState } from "react";
import { Form } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming.ts";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import FerienIcals from "jc-shared/optionen/ferienIcals.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import useCheckErrors from "@/commons/useCheckErrors.ts";

export default function JazzFormAndHeader<T extends { toJSON: () => object }>({
  title,
  data,
  saveForm,
  children,
}: PropsWithChildren<{
  title: string;
  data?: T;
  saveForm: (vals: T) => void;
}>) {
  document.title = `JC-${title}`;
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);

  document.title = "Kalender";

  const [form] = Form.useForm<FerienIcals>();

  function initializeForm() {
    if (data) {
      const deepCopy = data.toJSON();
      form.setFieldsValue(deepCopy);
      const initial = data.toJSON();
      setInitialValue(initial);
      setDirty(areDifferent(initial, deepCopy));
      form.validateFields();
    }
  }
  useEffect(initializeForm, [form, data]);

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
      onFinish={() => saveForm(form.getFieldsValue(true))}
      layout="vertical"
    >
      <JazzPageHeader title={title} buttons={[<SaveButton key="save" disabled={!dirty || hasErrors} />]} hasErrors={hasErrors} />
      <RowWrapper>{children}</RowWrapper>
    </Form>
  );
}
