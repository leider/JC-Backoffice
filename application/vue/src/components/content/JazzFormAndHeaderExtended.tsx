import * as React from "react";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useState } from "react";
import { Form, FormInstance } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming.ts";
import { ResetButton, SaveButton } from "@/components/colored/JazzButtons.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { JazzPageHeader } from "@/widgets/JazzPageHeader.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import useCheckErrors from "@/commons/useCheckErrors.ts";
import cloneDeep from "lodash/cloneDeep";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import { NamePath } from "rc-field-form/es/interface";

export default function JazzFormAndHeaderExtended<T>({
  title,
  data,
  saveForm,
  additionalButtons,
  additionalButtonsLast,
  changedPropsToWatch,
  children,
  dateString,
  firstTag,
  tags,
  form,
  styledTitle,
  resetChanges,
}: PropsWithChildren<{
  title: string;
  data?: Partial<T>;
  saveForm: (vals: T) => void;
  additionalButtons?: ReactNode[];
  additionalButtonsLast?: ReactNode[];
  changedPropsToWatch?: NamePath[];
  dateString?: string;
  firstTag?: ReactNode;
  tags?: ReactNode[];
  form: FormInstance<T>;
  styledTitle?: React.JSX.Element;
  resetChanges?: () => void;
}>) {
  document.title = `JC-${title}`;
  const { isDirty, setIsDirty, setHasErrors } = useJazzContext();
  const [initialValue, setInitialValue] = useState<Partial<T>>({});
  useDirtyBlocker(isDirty);

  const updateDirtyIfChanged = useCallback(
    (initial: object & { id?: string }, current: object & { id?: string }) => {
      if (initial.id !== current.id) {
        return false;
      }
      logDiffForDirty(initial, current, false);
      const different = areDifferent(initial, current, ["agenturauswahl", "hotelauswahl", "endbestandEUR"]);
      setIsDirty(different);
      return different;
    },
    [setIsDirty],
  );

  useEffect(() => {
    if (data) {
      const deepCopy = cloneDeep(data);
      form.setFieldsValue(deepCopy as object);
      const initial = cloneDeep(form.getFieldsValue(true));
      setInitialValue(initial);
      form
        .validateFields()
        .then(() => updateDirtyIfChanged(initial, deepCopy))
        .catch(() => {
          // ignore
        });
    }
  }, [form, data, updateDirtyIfChanged]);

  const { hasErrors, checkErrors } = useCheckErrors(form);
  useEffect(() => {
    setHasErrors(hasErrors);
  }, [hasErrors, setHasErrors]);

  const buttons: ReactNode[] = (additionalButtons ?? [])
    .concat(resetChanges ? <ResetButton key="cancel" disabled={!isDirty} resetChanges={resetChanges} /> : [])
    .concat(<SaveButton key="save" disabled={!isDirty || hasErrors} />)
    .concat(additionalButtonsLast ?? []);

  return (
    <Form
      form={form}
      onValuesChange={() => {
        updateDirtyIfChanged(initialValue, form.getFieldsValue(true));
        checkErrors();
      }}
      onFinish={() =>
        form
          .validateFields()
          .then(async () => {
            saveForm(form.getFieldsValue(true));
          })
          .catch(() => {
            // ignore
          })
      }
      layout="vertical"
    >
      <JazzPageHeader
        title={styledTitle ?? title}
        buttons={buttons}
        hasErrors={hasErrors}
        dateString={dateString}
        firstTag={firstTag}
        tags={tags}
      />
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
