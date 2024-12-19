import { Input } from "antd";
import numeral from "numeral";
import { ForwardedRef, forwardRef, useCallback, useEffect, useState } from "react";

import { useFormats, useLimits, useSanitizeLocalInput } from "../../numericInputWidgets/hooks";

const NumericInTable = forwardRef(function (
  {
    value,
    onChange,
    save,
    decimals,
    suffix,
  }: {
    value?: number;
    onChange?: (value: number | null) => void;
    save: () => void;
    decimals: number;
    suffix?: string;
  },
  ref: ForwardedRef<any>,
) {
  const [internalValue, setInternalValue] = useState<string | undefined>("");

  const { internalFormat, displayFormat } = useFormats(decimals);
  const { minLimit, maxLimit } = useLimits(decimals);

  const updateValue = useCallback(
    (newValue: number | null, originalStringFromWidget?: string | null) => {
      value !== newValue && onChange!(newValue);

      const strValue = newValue === null ? "" : numeral(newValue).format(displayFormat);

      strValue !== originalStringFromWidget && setInternalValue(strValue);
    },
    [value, displayFormat, onChange],
  );

  const sanitizeLocalInput = useSanitizeLocalInput(updateValue, internalFormat, minLimit, maxLimit);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = ({ target: { value: widgetInput } }) => {
    const result = widgetInput ? numeral(widgetInput).value() || 0 : null;
    sanitizeLocalInput(result, widgetInput);
    save();
  };

  useEffect(() => {
    sanitizeLocalInput(value);
  }, [sanitizeLocalInput, value]);

  return (
    <Input
      ref={ref}
      inputMode={decimals > 0 ? "decimal" : "numeric"}
      onBlur={handleBlur}
      value={internalValue}
      onChange={({ target: { value: val } }) => setInternalValue(val)}
      suffix={suffix}
      onPressEnter={save}
    />
  );
});

export default NumericInTable;
