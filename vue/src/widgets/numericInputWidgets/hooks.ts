import { isNil } from "lodash";
import numeral from "numeral";
import { useCallback, useMemo } from "react";

export type TransformationFactor = 1 | 100;

/**
 * Based on the parameters, it gives back the formats used by the container widget.
 *
 * In case it is a percentage input with the transformToPercentage flag as true,
 * we add two additional decimal places to the internalFormat
 *
 * @param decimals Number of decimal places
 * @param isPercentageType Boolean
 * @param transformToPercentage Boolean
 *
 * @returns The internal format and display format for the EmbeddedNumberInput
 */

export const useFormats = (decimals: number, isPercentageType?: boolean, transformToPercentage?: boolean) => {
  const { internalFormat, displayFormat } = useMemo(() => {
    const defaultFormat = "0,0." + "0".repeat(decimals);

    const internalFormat = isPercentageType ? "0,0." + "0".repeat(decimals + (transformToPercentage ? 2 : 0)) : defaultFormat;

    const displayFormat = defaultFormat;

    return { internalFormat, displayFormat };
  }, [decimals, isPercentageType, transformToPercentage]);

  return { internalFormat, displayFormat };
};

/**
 * Returns the adjusted min and max limits based on parameters. The returned limits are memoized.
 *
 *
 * @param decimals Number of decimal places
 * @param {number} initialMin The lower limit
 * @param {number} imitialMax The upper limit
 * @param {boolean} exclusiveMin A boolean to tell, if we want the lower limit to be exclusive
 * @param {boolean} exclusiveMax If true, we subtract the smallest possible number from the initial limit
 * @returns The calculated limits based on the hooks arguments
 */
export const useLimits = (decimals: number, initialMin?: number, imitialMax?: number, exclusiveMin?: boolean, exclusiveMax?: boolean) => {
  const { minLimit, maxLimit } = useMemo(() => {
    const minimalIncrement = Math.pow(10, -1 * decimals);

    const minLimit = initialMin === undefined ? undefined : initialMin + (exclusiveMin ? minimalIncrement : 0);

    const maxLimit = imitialMax === undefined ? undefined : imitialMax - (exclusiveMax ? minimalIncrement : 0);

    return { minLimit, maxLimit };
  }, [initialMin, imitialMax, exclusiveMin, exclusiveMax, decimals]);

  return { minLimit, maxLimit };
};

/**
 * Returns a react Callback, which takes a value and refactors it, so it is a valid value.
 * Then, it fires the updateValue function, to modify the container widget's value.
 *
 * @param updateValue A function to execute when sanitizing is complete
 * @param internalFormat The format of the value when doing calculation with it
 * @param disabled A boolean to tell if the widget is disabled
 * @param minLimit Lower limit
 * @param maxLimit Upper limit
 *
 * @returns A function that sanitizes the input value it gets
 */
export const useSanitizeLocalInput = (
  updateValue: (newValue: number | null, originalStringFromWidget?: string | null) => void,
  internalFormat: string,
  minLimit?: number,
  maxLimit?: number,
) => {
  return useCallback(
    (input?: string | number | null, originalStringFromWidget?: string | null) => {
      let numValue = isNil(input) || input === "" ? null : numeral(numeral(input).format(internalFormat)).value();

      if (numValue !== null) {
        numValue = !isNil(minLimit) ? Math.max(minLimit, numValue) : numValue;
        numValue = !isNil(maxLimit) ? Math.min(maxLimit, numValue) : numValue;
      }

      updateValue(numValue, originalStringFromWidget);
    },
    [updateValue, internalFormat, minLimit, maxLimit],
  );
};
