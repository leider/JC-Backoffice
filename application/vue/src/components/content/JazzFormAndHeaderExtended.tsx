import * as React from "react";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useState } from "react";
import { Breadcrumb, type BreadcrumbProps, Form, FormInstance } from "antd";
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
import noop from "lodash/noop";

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
  style,
  resetChanges,
  breadcrumb,
}: PropsWithChildren<{
  readonly title: string;
  readonly data?: Partial<T>;
  readonly saveForm: (vals: T) => void;
  readonly additionalButtons?: ReactNode[];
  readonly additionalButtonsLast?: ReactNode[];
  readonly changedPropsToWatch?: NamePath[];
  readonly dateString?: string;
  readonly firstTag?: ReactNode;
  readonly tags?: ReactNode[];
  readonly form: FormInstance<T>;
  readonly style?: React.CSSProperties;
  readonly resetChanges?: () => Promise<unknown>;
  readonly breadcrumb?: Partial<BreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
}>) {
  document.title = `JC-${title}`;
  window?.scroll?.({ top: 0 });

  const { isDirty, setIsDirty } = useJazzContext();
  const [initialValue, setInitialValue] = useState<Partial<T> | undefined>();
  const [loaded, setLoaded] = useState(false);
  useDirtyBlocker(isDirty);
  const { hasErrors, checkErrors } = useCheckErrors(form, loaded);

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
          setLoaded(true);
          return checkErrors();
        })
        .catch(noop);
    }
  }, [form, initialValue, updateDirtyIfChanged, checkErrors]);

  const buttons: ReactNode[] = (additionalButtons ?? [])
    .concat(resetChanges ? <ResetButton disabled={!isDirty} key="cancel" resetChanges={resetChanges} /> : [])
    .concat(<SaveButton disabled={!isDirty || hasErrors} key="save" />)
    .concat(additionalButtonsLast ?? []);

  return (
    <Form
      colon={false}
      form={form}
      layout="vertical"
      onFinish={() =>
        form
          .validateFields()
          .then(async () => {
            setIsDirty(false);
            saveForm(form.getFieldsValue(true));
          })
          .catch(checkErrors)
      }
      onKeyDown={(event) => {
        const target = event.target as HTMLInputElement;
        if (event.key === "Enter" && target?.role !== "textbox" && event?.type === "textarea") {
          event.preventDefault();
          return false;
        }
      }}
      onValuesChange={() => {
        updateDirtyIfChanged();
        checkErrors();
      }}
    >
      <JazzPageHeader
        breadcrumb={breadcrumb}
        buttons={buttons}
        dateString={dateString}
        firstTag={firstTag}
        hasErrors={hasErrors}
        style={style}
        tags={tags}
        title={title}
      />
      <RowWrapper>{children}</RowWrapper>
      {changedPropsToWatch ? <Form.Item dependencies={changedPropsToWatch} noStyle shouldUpdate={updateDirtyIfChanged} /> : null}
    </Form>
  );
}
