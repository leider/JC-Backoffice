import { useCallback, useState } from "react";
import { FormInstance } from "antd";
import { ValidateErrorEntity } from "@rc-component/form/lib/interface";

export default function useCheckErrors(form: FormInstance, loaded: boolean) {
  const [validateError, setValidateError] = useState<ValidateErrorEntity | undefined>();
  const checkErrors = useCallback(
    (keys?: string[]) => {
      if (!loaded) {
        return;
      }
      form
        .validateFields(keys, { recursive: true, validateOnly: false })
        .then(() => {
          setValidateError(undefined);
        })
        .catch((errorEntity: ValidateErrorEntity) => {
          setValidateError(errorEntity);
        });
    },
    [form, loaded],
  );

  return { validateError, checkErrors };
}
