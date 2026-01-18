import useFormItemStatus from "antd/es/form/hooks/useFormItemStatus";
import { useMemo } from "react";

export function useFormItemInTableStyle(useInTable?: boolean) {
  const { status } = useFormItemStatus();

  const isError = useMemo(() => status === "error", [status]);

  return useInTable ? { background: isError ? "var(--ant-color-error-bg)" : "inherit", borderWidth: isError ? undefined : 0 } : undefined;
}
