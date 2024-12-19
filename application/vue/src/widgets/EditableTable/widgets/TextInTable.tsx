import { ForwardedRef, forwardRef, useCallback } from "react";
import { Input } from "antd";

const TextInTable = forwardRef(function (
  {
    value,
    onChange,
    save,
  }: {
    value?: string;
    onChange?: (value: string) => void;
    save: () => void;
  },
  ref: ForwardedRef<any>,
) {
  const changed = useCallback(
    (text: string, trim?: boolean) => {
      const trimmedValue = trim ? text.trim() : text;
      onChange?.(trimmedValue);
    },
    [onChange],
  );

  return (
    <Input
      autoComplete="off"
      value={value}
      onChange={({ target: { value: nextValue } }) => {
        changed(nextValue);
      }}
      onBlur={({ target: { value: nextValue } }) => {
        changed(nextValue, true);
        save();
      }}
      ref={ref}
      onPressEnter={save}
    />
  );
});
export default TextInTable;
