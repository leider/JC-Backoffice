import { FC, PropsWithChildren } from "react";
import { Row } from "antd";

export const JazzRow: FC<PropsWithChildren & { ref?: React.LegacyRef<HTMLDivElement> }> = ({ ref, children }) => {
  return (
    <Row gutter={[12, 0]} ref={ref}>
      {children}
    </Row>
  );
};
