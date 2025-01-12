import React, { useMemo } from "react";
import { UserWithKann } from "@/widgets/MitarbeiterMultiSelect.tsx";
import { ErsthelferSymbol } from "@/widgets/ErsthelferSymbol.tsx";
import find from "lodash/find";

export function TagForUser({
  value,
  usersAsOptions,
  hideErsthelfer,
}: {
  value: string;
  usersAsOptions: UserWithKann[];
  hideErsthelfer?: boolean;
}) {
  const userWithKann = useMemo(() => find(usersAsOptions, { value: value }), [usersAsOptions, value]);
  const label = userWithKann?.label;

  const ersthelfer = useMemo(() => {
    return !hideErsthelfer && userWithKann?.kann.includes("Ersthelfer");
  }, [userWithKann?.kann, hideErsthelfer]);

  return (
    <>
      {label}
      {ersthelfer && <ErsthelferSymbol />}
    </>
  );
}
