import { PropsWithChildren } from "react";

export function RowWrapper({ children }: PropsWithChildren) {
  return <div style={{ marginLeft: "4px", marginRight: "4px" }}>{children}</div>;
}
