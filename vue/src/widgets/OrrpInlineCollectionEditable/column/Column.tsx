import { Col } from "antd";
import { FunctionComponent, PropsWithChildren } from "react";

import { IColumn } from "./IColumn";

/**
 * Orrp inline collection column component.
 * @param {PropsWithChildren<IColumn>} props
 * @return {*}  {React.ReactElement}
 */
export const Column: FunctionComponent<PropsWithChildren<IColumn>> = (props: PropsWithChildren<IColumn>): React.ReactElement => {
  const { desc, children, colSpans, className } = props;

  return (
    <Col span={colSpans[desc.idx]} className={className}>
      {children}
    </Col>
  );
};
