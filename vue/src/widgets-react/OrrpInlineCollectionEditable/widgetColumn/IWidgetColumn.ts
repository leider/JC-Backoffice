import { ColDescWithIdx } from "../types";

/**
 * Properties for the Orrp inline collection table widget column component.
 * @export
 * @interface IWidgetColumn
 */
export interface IWidgetColumn {
  /**
   * The description of the column.
   * @type {ColDescWithIdx}
   * @memberof IWidgetColumn
   */
  desc: ColDescWithIdx;

  /**
   * The name of the column.
   * @type {number}
   * @memberof IWidgetColumn
   */
  name: number;

  /**
   * The column span.
   * @type {number[]}
   * @memberof IWidgetColumn
   */
  colSpans: number[];

  /**
   * Whether the column is disabled.
   * @type {boolean}
   * @memberof IWidgetColumn
   */
  disabled?: boolean;

  /**
   * An unique values validator function.
   * @type {*}
   * @memberof IWidgetColumn
   */
  uniqueValuesValidator?: any;
}
