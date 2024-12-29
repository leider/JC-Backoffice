import * as React from "react";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useState } from "react";
import { Form } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming.ts";
import { SaveButton } from "@/components/colored/JazzButtons.tsx";
import FerienIcals from "jc-shared/optionen/ferienIcals.ts";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import useCheckErrors from "@/commons/useCheckErrors.ts";
import cloneDeep from "lodash/cloneDeep";

export default function JazzFormAndHeader<T>({
  title,
  data,
  saveForm,
  additionalButtons,
  changedPropsToWatch,
  children,
}: PropsWithChildren<{
  title: string;
  data?: Partial<T>;
  saveForm: (vals: T) => void;
  additionalButtons?: ReactNode[];
  changedPropsToWatch?: string[];
}>) {
  document.title = `JC-${title}`;
  const [initialValue, setInitialValue] = useState<Partial<T>>({});
  const [dirty, setDirty] = useState(false);
  useDirtyBlocker(dirty);

  const [form] = Form.useForm<FerienIcals>();

  const updateDirtyIfChanged = useCallback((initial: object & { id?: string }, current: object & { id?: string }) => {
    if (initial.id !== current.id) {
      return false;
    }
    logDiffForDirty(initial, current, false);
    const different = areDifferent(initial, current);
    setDirty(different);
    return different;
  }, []);

  useEffect(() => {
    if (data) {
      const deepCopy = cloneDeep(data);
      form.setFieldsValue(deepCopy);
      const initial = cloneDeep(form.getFieldsValue(true));
      setInitialValue(initial);
      form.validateFields().then(() => updateDirtyIfChanged(initial, deepCopy));
    }
  }, [form, data, updateDirtyIfChanged]);

  const { hasErrors, checkErrors } = useCheckErrors(form);

  const buttons: ReactNode[] = (additionalButtons ?? []).concat(<SaveButton key="save" disabled={!dirty || hasErrors} />);

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
      <JazzPageHeader title={title} buttons={buttons} hasErrors={hasErrors} />
      <RowWrapper>{children}</RowWrapper>
      {changedPropsToWatch && (
        <Form.Item
          dependencies={changedPropsToWatch}
          noStyle
          shouldUpdate={() => updateDirtyIfChanged(initialValue, form.getFieldsValue(true))}
        />
      )}
    </Form>
  );
}
