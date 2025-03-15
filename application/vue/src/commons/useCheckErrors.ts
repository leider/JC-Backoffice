import { useCallback, useState } from "react";
import { FormInstance } from "antd";

export default function useCheckErrors(form: FormInstance, loaded: boolean) {
  const [hasErrors, setHasErrors] = useState(false);
  const checkErrors = useCallback(() => {
    if (!loaded) {
      return;
    }
    form
      .validateFields({ recursive: true })
      .then(() => {
        setHasErrors(false);
      })
      .catch((reason: { errorFields: unknown[] }) => {
        setHasErrors(loaded && !!reason.errorFields?.length);
      });
  }, [form, loaded]);

  return { hasErrors, checkErrors };
}
