import { useWatch } from "antd/es/form/Form";
import { useMemo } from "react";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import KonzertWithRiderBoxes from "jc-shared/konzert/konzertWithRiderBoxes.ts";
import Konzert from "jc-shared/konzert/konzert.ts";

export default function useHotelSummierer() {
  const form = useFormInstance<KonzertWithRiderBoxes>();
  const unterkunft = useWatch("unterkunft", { preserve: true });

  return useMemo(
    () => new Konzert(form.getFieldsValue(true)).unterkunft,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unterkunft],
  );
}
