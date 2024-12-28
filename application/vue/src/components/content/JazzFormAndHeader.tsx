import * as React from "react";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
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
}: PropsWithChildren<{ title: string; data?: T; saveForm: (vals: T) => void }>) {
  document.title = `JC-${title}`;
  const [initialValue, setInitialValue] = useState<object>({});
  const [dirty, setDirty] = useState<boolean>(false);
  useDirtyBlocker(dirty);

  const [form] = Form.useForm<FerienIcals>();

  const updateDirtyIfChanged = useCallback((initial: object, current: object) => {
    logDiffForDirty(initial, current, false);
    setDirty(areDifferent(initial, current));
  }, []);

  useEffect(() => {
    if (data) {
      const deepCopy = data.toJSON();
      form.setFieldsValue(deepCopy);
      const initial = data.toJSON();
      setInitialValue(initial);
      updateDirtyIfChanged(initial, deepCopy);
      form.validateFields();
    }
  }, [form, data, updateDirtyIfChanged]);

  const { hasErrors, checkErrors } = useCheckErrors(form);

  return (
    <Form
      form={form}
      onValuesChange={() => {
        updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
        checkErrors();
      }}
      onFinish={() =>
        form.validateFields().then(async () => {
          saveForm(form.getFieldsValue(true));
        })
      }
      layout="vertical"
    >
      <JazzPageHeader title={title} buttons={[<SaveButton key="save" disabled={!dirty || hasErrors} />]} hasErrors={hasErrors} />
      <RowWrapper>{children}</RowWrapper>
    </Form>
  );
}
