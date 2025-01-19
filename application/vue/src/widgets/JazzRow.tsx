import { forwardRef, PropsWithChildren, Ref } from "react";
import { Row } from "antd";

export const JazzRow = forwardRef(function JazzRow({ children }: PropsWithChildren, ref: Ref<HTMLDivElement> | undefined) {
  return (
    <Row gutter={[12, 0]} ref={ref}>
      {children}
    </Row>
  );
});
