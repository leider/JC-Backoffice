import { FC, PropsWithChildren } from "react";

export const RowWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div style={{ marginLeft: "12px", marginRight: "12px" }}>{children}</div>;
};
