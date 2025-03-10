import { useWatch } from "antd/es/form/Form";
import { useMemo } from "react";
import Kasse from "jc-shared/konzert/kasse.ts";

export default function useKassenSaldierer() {
  const kasse = useWatch("kasse", { preserve: true });

  return useMemo(() => new Kasse(kasse), [kasse]);
}
