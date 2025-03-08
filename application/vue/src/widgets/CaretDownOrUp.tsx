import * as React from "react";
import { useMemo } from "react";
import { CaretDown, CaretRight } from "react-bootstrap-icons";
import { useJazzContext } from "@/components/content/useJazzContext.ts";

export type CaretDownOrUpProps = {
  readonly color?: string;
  readonly isActive?: boolean;
  readonly size?: number;
};

export default function CaretDownOrUp({ color, isActive, size }: CaretDownOrUpProps) {
  const { brightText } = useJazzContext();
  const realColor = useMemo(() => (color ? color : brightText), [brightText, color]);
  return isActive ? <CaretDown color={realColor} size={size} /> : <CaretRight color={realColor} size={size} />;
}
