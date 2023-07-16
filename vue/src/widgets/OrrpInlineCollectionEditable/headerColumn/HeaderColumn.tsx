import { FunctionComponent } from "react";

import { Column } from "../column/Column";
import { IHeaderColumn } from "./IHeaderColumn";
import { Col } from "antd";

/**
 * Orrp Inline collection table header column.
 * @param {IHeaderColumn} props
 * @return {*}
 */
export const HeaderColumn: FunctionComponent<IHeaderColumn> = (props: IHeaderColumn) => {
  const { desc, colSpans } = props;
  console.log({ colSpans });
  const labelText = desc.label || desc.fieldName;

  const theLabel = (
    <label title={labelText} className={"ant-form" + (desc.required ? "-item-required" : "")}>
      {labelText}
    </label>
  );
  return desc.idx === colSpans.length - 2 ? (
    <Col flex={"auto"} className="ant-form-item-label">
      {theLabel}
    </Col>
  ) : (
    <Column desc={desc} colSpans={colSpans} className="ant-form-item-label">
      {theLabel}
    </Column>
  );
};
