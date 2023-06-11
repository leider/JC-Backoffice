import { ColDescWithIdx } from "../types";

/**
 * Properties of the Orrp Inline collection table header column.
 * @export
 * @interface IHeaderColumn
 */
export interface IHeaderColumn {
  /**
   * The description of the column header.
   * @type {ColDescWithIdx}
   * @memberof IHeaderColumn
   */
  desc: ColDescWithIdx;

  /**
   * The span of the header column.
   * @type {number[]}
   * @memberof IHeaderColumn
   */
  colSpans: number[];
}
