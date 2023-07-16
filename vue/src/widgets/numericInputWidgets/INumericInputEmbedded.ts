import { ReactNode } from "react";

/**
 * Properties for the numeric input component.
 * @export
 * @interface INumericInputEmbedded
 */
export interface INumericInputEmbedded {
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
  onNumber?: (value: any) => void;

  /**
   * Callback for when the number is changed.
   * @memberof INumericInputEmbedded
   */
  onChange?: (value: any) => void;
  suffix?: ReactNode;
}
