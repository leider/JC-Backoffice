import * as React from "react";
import { PropsWithChildren, ReactElement, ReactNode, useCallback, useEffect, useState } from "react";
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
  breadcrumb,
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
  resetChanges?: () => Promise<unknown>;
  breadcrumb?: ReactElement;
}>) {
  document.title = `JC-${title}`;
  const { isDirty, setIsDirty, setHasErrors } = useJazzContext();
  const [initialValue, setInitialValue] = useState<Partial<T>>({});
  useDirtyBlocker(isDirty);
  const { hasErrors, checkErrors } = useCheckErrors(form);

  const updateDirtyIfChanged = useCallback(() => {
    const curr = form.getFieldsValue(true);
    logDiffForDirty(initialValue, curr, false);
    const different = areDifferent(initialValue, curr, ["agenturauswahl", "hotelauswahl", "endbestandEUR"]);
    setIsDirty(different);
    return different;
  }, [form, initialValue, setIsDirty]);

  useEffect(() => {
    if (data) {
      const initial = cloneDeep(data);
      setInitialValue(initial);
    }
  }, [data]);

  useEffect(() => {
    if (initialValue) {
      const deepCopy = cloneDeep(initialValue);
      form.setFieldsValue(deepCopy as object);
      form
        .validateFields()
        .then(() => {
          updateDirtyIfChanged();
          return checkErrors();
        })
        .catch(() => {
          // ignore
        });
    }
  }, [form, initialValue, updateDirtyIfChanged, checkErrors]);

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
        updateDirtyIfChanged();
        checkErrors();
      }}
      onFinish={() =>
        form
          .validateFields()
          .then(async () => {
            setIsDirty(false);
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
        breadcrumb={breadcrumb}
      />
      <RowWrapper>{children}</RowWrapper>
      {changedPropsToWatch && <Form.Item dependencies={changedPropsToWatch} noStyle shouldUpdate={updateDirtyIfChanged} />}
    </Form>
  );
}
