import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { useMemo } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import KonzertKalkulation from "jc-shared/konzert/konzertKalkulation.ts";

export default function useEinnahmen() {
  const form = useFormInstance();
  const preisprofil = useWatch(["eintrittspreise", "preisprofil"], { form, preserve: true });
  const einnahmenReservix = useWatch(["kasse", "einnahmenReservix"], { form, preserve: true });
  const zuschuss = useWatch(["eintrittspreise", "zuschuss"], { form, preserve: true });
  const erwarteteBesucher = useWatch(["eintrittspreise", "erwarteteBesucher"], { form, preserve: true });

  return useMemo(
    () => {
      const konzert = new Konzert(form.getFieldsValue(true));
      const kalk = new KonzertKalkulation(konzert);
      return konzert.eintrittspreise.zuschuss + kalk.erwarteterOderEchterEintritt;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [preisprofil, einnahmenReservix, zuschuss, erwarteteBesucher],
  );
}
