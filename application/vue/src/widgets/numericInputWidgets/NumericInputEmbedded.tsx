import { Input, InputRef } from "antd";
import numeral from "numeral";
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { useFormats, useLimits, useSanitizeLocalInput } from "./hooks";
import isEqual from "lodash/isEqual";

interface INumericInputEmbedded {
  id?: string;
  /**
   * The number;
   * @type {(number | null)}
   * @memberof INumericInputEmbedded
   */
  number?: number | null;

  /**
   * The number of decimals.
   * @type {number}
   * @memberof INumericInputEmbedded
   */
  decimals: number;

  /**
   * Whether the input is disabled.
   * @type {boolean}
   * @memberof INumericInputEmbedded
   */
  disabled?: boolean;

  /**
   * The minimum number.
   * @type {number}
   * @memberof INumericInputEmbedded
   */
  min?: number;

  /**
   * The maximum number.
   * @type {number}
   * @memberof INumericInputEmbedded
   */
  max?: number;

  /**
   * The exclusive minimum.
   * @type {boolean}
   * @memberof INumericInputEmbedded
   */
  exclusiveMin?: boolean;

  /**
   * The exclusive maximum.
   * @type {boolean}
   * @memberof INumericInputEmbedded
   */
  exclusiveMax?: boolean;

  /**
   * Callback for when the number is updated.
   * @memberof INumericInputEmbedded
   */
  onNumber?: (value: number | null) => void;

  /**
   * Callback for when the number is changed.
   * @memberof INumericInputEmbedded
   */
  onChange?: (value: number | null) => void;
  suffix?: ReactNode;
  save?: () => void;
  focus?: boolean;
}

/**
 * Numeric input component.
 * @param {INumericInputEmbedded} props
 * @return {*}  {React.ReactElement}
 */
const NumericInputEmbedded: FC<INumericInputEmbedded> = ({
  number,
  decimals,
  min,
  max,
  exclusiveMin,
  exclusiveMax,
  disabled,
  onChange,
  onNumber,
  suffix,
  id,
  save,
  focus,
}: INumericInputEmbedded): React.ReactElement => {
  const [value, setValue] = useState<string | undefined>("");

  const { internalFormat, displayFormat } = useFormats(decimals);
  const { minLimit, maxLimit } = useLimits(decimals, min, max, exclusiveMin, exclusiveMax);

  const updateValue = useCallback(
    (newValue: number | null, originalStringFromWidget?: string | null) => {
      const oldValue = numeral(number ?? null).value();
      number !== newValue && onNumber!(newValue);
      if (!isEqual(oldValue, newValue)) {
        onChange?.(newValue);
      }

      const strValue = newValue === null ? "" : numeral(newValue).format(displayFormat);

      strValue !== originalStringFromWidget && setValue(strValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [number, displayFormat, onNumber],
  );

  const sanitizeLocalInput = useSanitizeLocalInput(updateValue, internalFormat, minLimit, maxLimit);

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = ({ target: { value: widgetInput } }) => {
    const result = widgetInput ? numeral(widgetInput).value() || 0 : null;
    sanitizeLocalInput(result, widgetInput);
    save?.();
  };
  useEffect(() => {
    if (focus && value) {
      inputRef.current?.focus();
    }
  }, [focus, value]);

  function handleFocus() {
    inputRef.current?.focus({ cursor: "all" });
  }

  useEffect(() => {
    sanitizeLocalInput(number);
  }, [sanitizeLocalInput, number, disabled]);

  const inputRef = useRef<InputRef>(null);

  return (
    <Input
      ref={inputRef}
      id={id}
      inputMode={decimals > 0 ? "decimal" : "numeric"}
      onBlur={handleBlur}
      onFocus={handleFocus}
      disabled={disabled}
      value={value}
      onChange={({ target: { value: val } }) => setValue(val)}
      suffix={suffix}
      onPressEnter={save}
    />
  );
};

export default NumericInputEmbedded;
