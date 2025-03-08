import * as React from "react";
import { ReactElement } from "react";
import CaretDownOrUp, { CaretDownOrUpProps } from "@/widgets/CaretDownOrUp.tsx";

export function expandIcon({ color, size }: CaretDownOrUpProps): (panelProps: { isActive?: boolean }) => ReactElement {
  return function ExpandIcon({ isActive }) {
    return <CaretDownOrUp color={color} isActive={isActive} size={size} />;
  };
}
