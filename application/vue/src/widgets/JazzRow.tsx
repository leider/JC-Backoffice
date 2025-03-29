import { PropsWithChildren } from "react";
import { Row } from "antd";

export function JazzRow({ children }: PropsWithChildren) {
  return <Row gutter={[12, 0]}>{children}</Row>;
}
