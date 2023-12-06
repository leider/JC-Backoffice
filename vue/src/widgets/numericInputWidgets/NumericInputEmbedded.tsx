import { Input } from "antd";
import numeral from "numeral";
import { FunctionComponent, useCallback, useEffect, useState } from "react";

import { useFormats, useLimits, useSanitizeLocalInput } from "./hooks";
import { INumericInputEmbedded } from "./INumericInputEmbedded";
import isEqual from "lodash/isEqual";

/**
 * Numeric input component.
 * @param {INumericInputEmbedded} props
 * @return {*}  {React.ReactElement}
 */
const NumericInputEmbedded: FunctionComponent<INumericInputEmbedded> = (props: INumericInputEmbedded): React.ReactElement => {
  const { number, decimals, min, max, exclusiveMin, exclusiveMax, disabled, onChange, onNumber, suffix } = props;

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
  };

  useEffect(() => {
    sanitizeLocalInput(number);
  }, [sanitizeLocalInput, number, disabled]);

  return (
    <Input
      id={props.id}
      inputMode="numeric"
      onBlur={handleBlur}
      disabled={disabled}
      value={value}
      onChange={({ target: { value: val } }) => setValue(val)}
      suffix={suffix}
    />
  );
};

export default NumericInputEmbedded;
