import * as React from "react";
import { PropsWithChildren, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { Drawer, Form } from "antd";
import { areDifferent } from "@/commons/comparingAndTransforming.ts";
import { ResetButton, SaveButton } from "@/components/colored/JazzButtons.tsx";
import { useDirtyBlocker } from "@/commons/useDirtyBlocker.tsx";
import { RowWrapper } from "@/widgets/RowWrapper.tsx";
import { logDiffForDirty } from "jc-shared/commons/comparingAndTransforming.ts";
import useCheckErrors from "@/commons/useCheckErrors.ts";
import cloneDeep from "lodash/cloneDeep";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import noop from "lodash/noop";
import { JazzFormContext } from "@/components/content/useJazzFormContext.ts";
import ButtonWithIcon from "@/widgets/buttonsAndIcons/ButtonWithIcon.tsx";
import { ButtonType, colorsAndIconsForSections } from "@/widgets/buttonsAndIcons/colorsIconsForSections.ts";

export default function JazzDrawerWithForm<T>({
  title,
  data,
  saveForm,
  additionalButtons,
  additionalButtonsLast,
  children,
  resetChanges,
  buttonText,
  buttonType,
}: PropsWithChildren<{
  readonly title: string;
  readonly buttonText: string;
  readonly buttonType: ButtonType;
  readonly data?: Partial<T>;
  readonly saveForm: (vals: T) => void;
  readonly additionalButtons?: ReactNode[];
  readonly additionalButtonsLast?: ReactNode[];
  readonly style?: React.CSSProperties;
  readonly resetChanges?: () => Promise<unknown>;
}>) {
  const { color, icon } = colorsAndIconsForSections;
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<T>();
  const { isDirty, setIsDirty } = useJazzContext();
  const [initialValue, setInitialValue] = useState<Partial<T> | undefined>();
  const [loaded, setLoaded] = useState(false);
  useDirtyBlocker(isDirty);
  const { hasErrors, checkErrors } = useCheckErrors(form, loaded);

  const updateDirtyIfChanged = useCallback(() => {
    const curr = form.getFieldsValue(true);
    logDiffForDirty(initialValue, curr, false);
    const different = areDifferent(initialValue, curr);
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

  const jazzFormContext = useMemo(() => {
    return { checkDirty: updateDirtyIfChanged };
  }, [updateDirtyIfChanged]);

  return (
    <JazzFormContext.Provider value={jazzFormContext}>
      <Drawer
        closable={!isDirty}
        extra={buttons}
        maskClosable={!isDirty}
        onClose={() => setOpen(false)}
        open={open}
        placement="top"
        size="large"
        title={title}
      >
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
          <RowWrapper>{children}</RowWrapper>
        </Form>
      </Drawer>
      <ButtonWithIcon alwaysText block color={color(buttonType)} icon={icon(buttonType)} onClick={() => setOpen(true)} text={buttonText} />
    </JazzFormContext.Provider>
  );
}
