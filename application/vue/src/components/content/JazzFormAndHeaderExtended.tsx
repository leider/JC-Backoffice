import * as React from "react";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
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
import noop from "lodash/noop";
import { JazzFormContext } from "@/components/content/useJazzFormContext.ts";
import debounce from "lodash/debounce";
import keys from "lodash/keys";

export default function JazzFormAndHeaderExtended<T>({
  title,
  data,
  saveForm,
  additionalButtons,
  additionalButtonsLast,
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
  readonly dateString?: string;
  readonly firstTag?: ReactNode;
  readonly tags?: ReactNode[];
  readonly form: FormInstance<T>;
  readonly style?: React.CSSProperties;
  readonly resetChanges?: () => Promise<unknown>;
  readonly breadcrumb?: Partial<BreadcrumbProps> | React.ReactElement<typeof Breadcrumb>;
}>) {
  document.title = `JC-${title}`;
  window.scroll({ top: 0 });

  const { isDirty, setIsDirty } = useJazzContext();
  const [initialValue, setInitialValue] = useState<Partial<T> | undefined>();
  const [loaded, setLoaded] = useState(false);
  useDirtyBlocker(isDirty);
  const { validateError, checkErrors } = useCheckErrors(form, loaded);
  const updateDirtyIfChanged = useCallback(() => {
    const curr = form.getFieldsValue(true);
    logDiffForDirty(initialValue, curr, false);
    const different = areDifferent(initialValue, curr);
    setIsDirty(different);
    return different;
  }, [form, initialValue, setIsDirty]);

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

  const debouncedCheckErrors = useMemo(
    () =>
      debounce((keys?: string[]) => {
        updateDirtyIfChanged();
        checkErrors(keys);
      }, 50),
    [checkErrors, updateDirtyIfChanged],
  );

  const onValuesChanged = useCallback(
    (changedValues: Partial<T>) => {
      debouncedCheckErrors(keys(changedValues));
    },
    [debouncedCheckErrors],
  );

  const resetAndCheckErrors = useCallback(() => {
    resetChanges?.();
    debouncedCheckErrors();
  }, [debouncedCheckErrors, resetChanges]);

  const buttons: ReactNode[] = useMemo(
    () =>
      (additionalButtons ?? [])
        .concat(resetChanges ? <ResetButton disabled={!isDirty} key="cancel" resetChanges={resetAndCheckErrors} /> : [])
        .concat(<SaveButton disabled={!isDirty || !!validateError} key="save" />)
        .concat(additionalButtonsLast ?? []),
    [additionalButtons, additionalButtonsLast, validateError, isDirty, resetAndCheckErrors, resetChanges],
  );

  const jazzFormContext = useMemo(() => {
    return { checkDirty: updateDirtyIfChanged };
  }, [updateDirtyIfChanged]);

  const onFinish = useCallback(
    () =>
      form
        .validateFields()
        .then(async () => {
          setIsDirty(false);
          saveForm(form.getFieldsValue(true));
        })
        .catch(checkErrors),
    [checkErrors, form, saveForm, setIsDirty],
  );

  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLFormElement>) => {
    const target = event.target as HTMLInputElement;
    if (event.key === "Enter" && target?.role !== "textbox" && event?.type === "textarea") {
      event.preventDefault();
      return false;
    }
  }, []);

  useEffect(() => {
    if (data) {
      const initial = cloneDeep(data);
      setInitialValue(initial);
    }
  }, [data]);

  return (
    <JazzFormContext.Provider value={jazzFormContext}>
      <Form
        colon={false}
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onKeyDown={onKeyDown}
        onValuesChange={onValuesChanged}
        variant="underlined"
      >
        <JazzPageHeader
          breadcrumb={breadcrumb}
          buttons={buttons}
          dateString={dateString}
          firstTag={firstTag}
          style={style}
          tags={tags}
          title={title}
          validateError={validateError}
        />
        <RowWrapper>{children}</RowWrapper>
      </Form>
    </JazzFormContext.Provider>
  );
}
