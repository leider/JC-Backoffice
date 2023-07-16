import { ColDescWithIdx } from "../types";

/**
 * Properties of the Orrp inline collection column component.
 * @export
 * @interface IColumn
 */
export interface IColumn {
  /**
   * The column description.
   * @type {ColDescWithIdx}
   * @memberof IColumn
   */
  desc: ColDescWithIdx;

  /**
   * The column span.
   * @type {number[]}
   * @memberof IColumn
   */
  colSpans: number[];

  /**
   * An optional classname for the column.
   * @type {string}
   * @memberof IColumn
   */
  className?: string;
}
