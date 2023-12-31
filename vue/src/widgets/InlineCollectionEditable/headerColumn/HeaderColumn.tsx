import { FC } from "react";

import { Column } from "../column/Column";
import { Col } from "antd";
import { ColDescWithIdx } from "@/widgets/InlineCollectionEditable/types.ts";

interface IHeaderColumn {
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

/**
 * Inline collection table header column.
 * @param {IHeaderColumn} props
 * @return {*}
 */
export const HeaderColumn: FC<IHeaderColumn> = (props: IHeaderColumn) => {
  const { desc, colSpans } = props;
  const labelText = desc.label || desc.fieldName;

  const theLabel = (
    <label title={labelText} className={"ant-form" + (desc.required ? "-item-required" : "")}>
      {labelText}
    </label>
  );
  return desc.idx === 0 ? (
    <Col flex={"auto"} className="ant-form-item-label">
      {theLabel}
    </Col>
  ) : (
    <Column desc={desc} colSpans={colSpans} className="ant-form-item-label">
      {theLabel}
    </Column>
  );
};
