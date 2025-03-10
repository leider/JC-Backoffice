import { useWatch } from "antd/es/form/Form";
import useFormInstance from "antd/es/form/hooks/useFormInstance";
import { useMemo } from "react";
import Konzert from "jc-shared/konzert/konzert.ts";
import useHotelSummierer from "@/components/konzert/hotel/useHotelSummierer.ts";

export default function useAusgaben() {
  const form = useFormInstance();
  const { kostenTotalEUR } = useHotelSummierer();
  const brauchtHotel = useWatch(["artist", "brauchtHotel"], { preserve: true });

  const kosten = useWatch("kosten", { preserve: true });

  return useMemo(
    () => {
      const konzert = new Konzert(form.getFieldsValue(true));
      return konzert.kasse.ausgabenOhneGage + konzert.kosten.totalEUR + (konzert.artist.brauchtHotel ? kostenTotalEUR : 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [kostenTotalEUR, brauchtHotel, kosten],
  );
}
