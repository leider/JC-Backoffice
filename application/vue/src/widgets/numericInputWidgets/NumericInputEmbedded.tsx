import { Input, InputRef } from "antd";
import numeral from "numeral";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { useFormats, useLimits, useSanitizeLocalInput } from "./hooks";
import isEqual from "lodash/isEqual";

interface INumericInputEmbedded {
  readonly id?: string;
  /**
   * The number;
   * @type {(number | null)}
   * @memberof INumericInputEmbedded
   */
  readonly number?: number | null;

  /**
   * The number of decimals.
   * @type {number}
   * @memberof INumericInputEmbedded
   */
  readonly decimals: number;

  /**
   * Whether the input is disabled.
   * @type {boolean}
   * @memberof INumericInputEmbedded
   */
  readonly disabled?: boolean;

  /**
   * The minimum number.
   * @type {number}
   * @memberof INumericInputEmbedded
   */
  readonly min?: number;

  /**
   * The maximum number.
   * @type {number}
   * @memberof INumericInputEmbedded
   */
  readonly max?: number;

  /**
   * Callback for when the number is updated.
   * @memberof INumericInputEmbedded
   */
  readonly onNumber?: (value: number | null) => void;

  /**
   * Callback for when the number is changed.
   * @memberof INumericInputEmbedded
   */
  readonly onChange?: (value: number | null) => void;
  readonly suffix?: ReactNode;
  readonly save?: (keepEditing?: boolean) => void;
  readonly focus?: boolean;
}

function NumericInputEmbedded({
  number,
  decimals,
  min,
  max,
  disabled,
  onChange,
  onNumber,
  suffix,
  id,
  save,
  focus,
}: INumericInputEmbedded) {
  const [value, setValue] = useState<string | undefined>("");

  const { internalFormat, displayFormat } = useFormats(decimals);
  const { minLimit, maxLimit } = useLimits(decimals, min, max);

  const updateValue = useCallback(
    (newValue: number | null, originalStringFromWidget?: string | null) => {
      const oldValue = numeral(number ?? null).value();
      number !== newValue && onNumber?.(newValue);
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

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = useCallback(
    ({ target: { value: widgetInput } }) => {
      const result = widgetInput ? numeral(widgetInput).value() || 0 : null;
      sanitizeLocalInput(result, widgetInput);
      save?.();
    },
    [sanitizeLocalInput, save],
  );

  useEffect(() => {
    if (focus && value) {
      inputRef.current?.focus();
    }
  }, [focus, value]);

  const handleFocus = useCallback(() => inputRef.current?.focus({ cursor: "all" }), []);

  useEffect(() => {
    sanitizeLocalInput(number);
  }, [sanitizeLocalInput, number, disabled]);

  const inputRef = useRef<InputRef>(null);

  const onChangeHandler = useCallback(({ target: { value: val } }: { target: { value: string } }) => setValue(val), []);
  const onPressEnter = useCallback(() => save?.(), [save]);
  return (
    <Input
      disabled={disabled}
      id={id}
      inputMode={decimals > 0 ? "decimal" : "numeric"}
      onBlur={handleBlur}
      onChange={onChangeHandler}
      onFocus={handleFocus}
      onPressEnter={onPressEnter}
      ref={inputRef}
      suffix={suffix}
      value={value}
    />
  );
}

export default NumericInputEmbedded;
