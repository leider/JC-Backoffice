import { FC, PropsWithChildren } from "react";

export const RowWrapper: FC<PropsWithChildren> = ({ children }) => {
  return <div style={{ marginLeft: "4px", marginRight: "4px" }}>{children}</div>;
};
