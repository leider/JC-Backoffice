import React, { useMemo } from "react";
import { useJazzContext } from "@/components/content/useJazzContext.ts";
import map from "lodash/map";

export function useEventTypes() {
  const { optionen } = useJazzContext();
  return useMemo(() => {
    return map(optionen.typenPlus, (typ) => ({
      label: <span style={{ color: typ.color }}>{typ.name}</span>,
      value: typ.name,
    }));
  }, [optionen.typenPlus]);
}
