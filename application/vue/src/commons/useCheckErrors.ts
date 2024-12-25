import { useCallback, useState } from "react";
import { FormInstance } from "antd";

export default function useCheckErrors(form: FormInstance) {
  const [hasErrors, setHasErrors] = useState(false);
  const checkErrors = useCallback(() => {
    form
      .validateFields()
      .then(() => {
        setHasErrors(false);
      })
      .catch((reason: { errorFields: unknown[] }) => {
        setHasErrors(!!reason.errorFields?.length);
      });
  }, [form]);

  return { hasErrors, checkErrors };
}
