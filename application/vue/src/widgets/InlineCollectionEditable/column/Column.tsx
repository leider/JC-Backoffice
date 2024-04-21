import { Col } from "antd";
import { FC, PropsWithChildren } from "react";
import { ColDescWithIdx } from "@/widgets/InlineCollectionEditable/types.ts";

interface IColumn {
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

/**
 * Inline collection column component.
 * @param {PropsWithChildren<IColumn>} props
 * @return {*}  {React.ReactElement}
 */
export const Column: FC<PropsWithChildren<IColumn>> = ({
  desc,
  children,
  colSpans,
  className,
}: PropsWithChildren<IColumn>): React.ReactElement => {
  return (
    <Col span={colSpans[desc.idx]} className={className}>
      {children}
    </Col>
  );
};
